import { Context } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { TEST_STATE_SUBMITTER_USER } from "mocks";
import { convertObjToBase64, createKafkaEvent, createKafkaRecord } from "mocks/helpers/kafka.utils";
import { Action, opensearch } from "shared-types";
import { formatNinetyDaysDate, getAvailableActions } from "shared-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "../sinkSmart";
import * as errors from "./publishSmartIngestError";

const ID = "OH-26-1112-CHIP";
const EXTERNAL_ID = "chip-lifecycle-smart-record";
const TOPIC = "aws.mulesoft.onemac.events";
const SUBMITTED_AT = "2026-11-01T18:00:00.000Z";
const file = {
  filename: "test.pdf",
  title: "Test document",
  bucket: "test-attachments",
  key: "test.pdf",
  uploadDate: Date.parse(SUBMITTED_AT),
};
const attachment = { files: [file], label: "Test document" };
type StateAction =
  | "new-chip-submission"
  | "new-chip-details-submission"
  | "upload-subsequent-documents"
  | "respond-to-rai"
  | "withdraw-rai"
  | "withdraw-package";

let document: opensearch.main.Document;
let history: Record<string, unknown>[];
let version: number;

const applyStateAction = (
  event: StateAction,
  timestamp: string,
  fields: Record<string, unknown> = {},
) => {
  const payload = {
    id: ID,
    event,
    authority: "CHIP SPA",
    origin: "mako",
    timestamp: Date.parse(timestamp),
    submitterName: "Example State User",
    submitterEmail: "state@example.com",
    additionalInformation: "State package action",
    ...fields,
  };
  const projection = opensearch.main.transforms[event].transform().parse(payload);
  document = { ...document, ...projection } as opensearch.main.Document;
  version++;
  history.push(opensearch.changelog.transforms[event].transform(history.length + 1).parse(payload));
};

const consumeSmart = async (
  status: string,
  changedAt: string,
  fields: Record<string, unknown> = {},
) => {
  const payload = {
    id: ID,
    spaWaiverId: EXTERNAL_ID,
    correlationId: `chip-status-${changedAt}`,
    origin: "SMART",
    authority: "CHIP SPA",
    operationType: "MSP_STATUS_UPDATED",
    status,
    createdAt: changedAt,
    statusChangedAt: changedAt,
    statusDate: changedAt.slice(0, 10),
    rai: { formalRaiRequested: false, raiRequestedDate: null },
    ...fields,
  };
  const record = createKafkaRecord({
    topic: TOPIC,
    key: Buffer.from(ID).toString("base64"),
    value: convertObjToBase64(payload),
  });
  await handler(createKafkaEvent({ [`${TOPIC}-0`]: [record] }), {} as Context, vi.fn());
};

const actions = () => getAvailableActions(TEST_STATE_SUBMITTER_USER, document);
const getSpy = vi.spyOn(os, "getItem");
const searchSpy = vi.spyOn(os, "search");
const updateSpy = vi.spyOn(os, "updateItem");
const createSpy = vi.spyOn(os, "createItem");
const bulkSpy = vi.spyOn(os, "bulkUpdateData");
const errorSpy = vi.spyOn(errors, "publishSmartIngestError");
vi.spyOn(sink, "logError").mockImplementation(() => undefined);

describe("CHIP lifecycle through SMART consumption and OneMAC action projections", () => {
  beforeEach(() => {
    vi.stubEnv("osDomain", "https://search.example.test");
    vi.stubEnv("indexNamespace", "test-");
    document = {} as opensearch.main.Document;
    history = [];
    version = 0;
    getSpy.mockReset().mockImplementation(async () => {
      return {
        found: true,
        _id: ID,
        _source: { ...document },
        _seq_no: version,
        _primary_term: 1,
      } as Awaited<ReturnType<typeof os.getItem>>;
    });
    searchSpy.mockReset().mockImplementation(async (_domain, index) => {
      return {
        hits: {
          hits: index.endsWith("changelog")
            ? history.map((entry) => ({ _id: entry.id, _source: entry }))
            : document.spaWaiverId === EXTERNAL_ID
              ? [{ _id: ID, _source: { ...document } }]
              : [],
        },
      } as Awaited<ReturnType<typeof os.search>>;
    });
    updateSpy.mockReset().mockImplementation(async (_domain, _index, id, updates, options) => {
      expect(id).toBe(ID);
      if (options && options.ifSeqNo !== version)
        throw new Error("version_conflict_engine_exception");
      document = { ...document, ...updates };
      version++;
    });
    createSpy.mockReset().mockResolvedValue({ created: true });
    bulkSpy.mockReset().mockImplementation(async (_domain, _index, entries) => {
      for (const entry of entries) {
        const existing = history.findIndex((stored) => stored.id === entry.id);
        if (existing >= 0) history[existing] = entry;
        else history.push(entry);
      }
    });
    errorSpy.mockReset().mockResolvedValue(undefined);
    applyStateAction("new-chip-details-submission", SUBMITTED_AT, {
      proposedEffectiveDate: Date.parse("2027-01-01T00:00:00.000Z"),
      attachments: {
        chipEligibility: attachment,
        coverLetter: attachment,
        currentStatePlan: {},
        amendedLanguage: {},
        budgetDocuments: {},
        publicNotice: {},
        tribalConsultation: {},
        other: {},
      },
    });
  });

  afterEach(() => vi.unstubAllEnvs());

  it("moves from Submitted through intake and review while preserving the State's latest activity", async () => {
    expect(document).toMatchObject({
      authority: "CHIP SPA",
      origin: "OneMAC",
      stateStatus: "Submitted",
      cmsStatus: "Submitted - Intake Needed",
      submissionDate: SUBMITTED_AT,
    });
    await consumeSmart("Intake Needed", "2026-11-01T18:01:00.000Z");
    expect(document.spaWaiverId).toBe(EXTERNAL_ID);
    expect(document.stateStatus).toBe("Submitted");
    await consumeSmart("Pending - First Clock", "2026-11-02T18:00:00.000Z");
    expect(document).toMatchObject({
      stateStatus: "Under Review",
      cmsStatus: "Pending",
      secondClock: false,
    });
    expect(actions()).toEqual([Action.UPLOAD_SUBSEQUENT_DOCUMENTS, Action.WITHDRAW_PACKAGE]);
    expect(document.makoChangedDate).toBe(SUBMITTED_AT);

    applyStateAction("upload-subsequent-documents", "2026-11-02T18:10:00.000Z", {
      attachments: { other: attachment },
    });
    expect(document.makoChangedDate).toBe("2026-11-02T18:10:00.000Z");
    expect(history.map((entry) => entry.event)).toEqual([
      "new-chip-details-submission",
      "upload-subsequent-documents",
    ]);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it.each(["before", "after"])(
    "supports response, withdrawal, resubmission, and another RAI with the toggle %s second-clock status",
    async (toggleOrder) => {
      const originalDeadline = formatNinetyDaysDate(Date.parse(document.submissionDate));
      await consumeSmart("Pending - First Clock", "2026-11-02T18:00:00.000Z");
      await consumeSmart("Pending RAI", "2026-11-03T18:00:00.000Z", {
        rai: {
          formalRaiRequested: true,
          raiRequestedDate: "2026-11-03",
          raiResponseReceivedDate: "2026-10-01",
          raiResponseWithdrawnDate: "2026-10-02",
        },
      });
      expect(document).toMatchObject({
        stateStatus: "RAI Issued",
        raiReceivedDate: null,
        raiWithdrawnDate: null,
        secondClock: false,
      });
      expect(actions()).toEqual([Action.RESPOND_TO_RAI, Action.WITHDRAW_PACKAGE]);

      // A legacy withdrawn date must not survive a newly submitted response.
      document.raiWithdrawnDate = "2026-11-03T18:30:00.000Z";
      applyStateAction("respond-to-rai", "2026-11-03T19:00:00.000Z", {
        attachments: {
          revisedAmendedStatePlanLanguage: attachment,
          officialRAIResponse: attachment,
          budgetDocuments: {},
          publicNotice: {},
          tribalConsultation: {},
          other: {},
        },
      });
      expect(document).toMatchObject({
        stateStatus: "Submitted",
        raiReceivedDate: "2026-11-03T19:00:00.000Z",
        raiWithdrawnDate: null,
        locked: true,
        raiWithdrawEnabled: false,
      });

      const enableToggle = () =>
        consumeSmart("Pending - Second Clock", "2026-11-03T20:01:00.000Z", {
          operationType: "MSP_RAI_WITHDRAWAL_TOGGLED",
          raiId: "chip-rai-1",
          raiName: `${ID}-RAI-1`,
          raiWithdrawnToggle: true,
          raiWithdrawnToggleDate: "2026-11-03T20:01:00.000Z",
        });
      const secondClock = () =>
        consumeSmart("Pending - Second Clock", "2026-11-03T20:00:00.000Z", {
          rai: {
            formalRaiRequested: true,
            raiRequestedDate: "2026-11-03",
            raiResponseReceivedDate: null,
            raiResponseWithdrawnDate: null,
          },
        });
      if (toggleOrder === "before") {
        await enableToggle();
        await secondClock();
      } else {
        await secondClock();
        await enableToggle();
      }
      expect(document).toMatchObject({
        stateStatus: "Under Review",
        secondClock: true,
        raiWithdrawEnabled: true,
        raiReceivedDate: "2026-11-03T19:00:00.000Z",
      });
      expect(actions()).toEqual([
        Action.UPLOAD_SUBSEQUENT_DOCUMENTS,
        Action.WITHDRAW_RAI,
        Action.WITHDRAW_PACKAGE,
      ]);

      applyStateAction("withdraw-rai", "2026-11-03T21:00:00.000Z", {
        attachments: { supportingDocumentation: {} },
      });
      expect(document).toMatchObject({
        stateStatus: "Formal RAI Response - Withdrawal Requested",
        raiWithdrawEnabled: false,
        secondClock: false,
        locked: true,
      });
      expect(actions()).toEqual([]);

      // SMART approves the withdrawal by returning to the prior RAI workflow.
      await consumeSmart("Pending RAI", "2026-11-04T17:00:00.000Z", {
        rai: { formalRaiRequested: true, raiRequestedDate: "2026-11-03" },
      });
      expect(actions()).toEqual([Action.RESPOND_TO_RAI, Action.WITHDRAW_PACKAGE]);
      applyStateAction("respond-to-rai", "2026-11-04T18:00:00.000Z", {
        attachments: {
          revisedAmendedStatePlanLanguage: attachment,
          officialRAIResponse: attachment,
          budgetDocuments: {},
          publicNotice: {},
          tribalConsultation: {},
          other: {},
        },
      });
      expect(document.raiReceivedDate).toBe("2026-11-04T18:00:00.000Z");
      await consumeSmart("Pending - Second Clock", "2026-11-04T19:00:00.000Z");

      await consumeSmart("Pending RAI", "2026-11-05T17:00:00.000Z", {
        rai: { formalRaiRequested: true, raiRequestedDate: "2026-11-05" },
      });
      expect(document).toMatchObject({
        stateStatus: "RAI Issued",
        raiReceivedDate: null,
        raiWithdrawnDate: null,
        raiWithdrawEnabled: false,
        submissionDate: SUBMITTED_AT,
      });
      expect(actions()).toEqual([Action.RESPOND_TO_RAI, Action.WITHDRAW_PACKAGE]);
      expect(formatNinetyDaysDate(Date.parse(document.submissionDate))).toBe(originalDeadline);
      expect(document.origin).toBe("OneMAC");
      expect(history.filter((entry) => !entry.isAdminChange).map((entry) => entry.event)).toEqual([
        "new-chip-details-submission",
        "respond-to-rai",
        "withdraw-rai",
        "respond-to-rai",
      ]);
      expect(history.filter((entry) => entry.isAdminChange).map((entry) => entry.event)).toEqual([
        "toggle-withdraw-rai",
      ]);
      expect(errorSpy).not.toHaveBeenCalled();
    },
  );

  it("preserves a submitted State response when the same issued-RAI Kafka event is replayed", async () => {
    const fields = { rai: { formalRaiRequested: true, raiRequestedDate: "2026-11-03" } };
    await consumeSmart("Pending RAI", "2026-11-03T18:00:00.000Z", fields);
    applyStateAction("respond-to-rai", "2026-11-03T19:00:00.000Z", {
      attachments: {
        revisedAmendedStatePlanLanguage: attachment,
        officialRAIResponse: attachment,
        budgetDocuments: {},
        publicNotice: {},
        tribalConsultation: {},
        other: {},
      },
    });
    const afterResponse = { ...document };
    await consumeSmart("Pending RAI", "2026-11-03T18:00:00.000Z", fields);
    expect(document).toEqual(afterResponse);
    expect(history).toHaveLength(2);
  });

  it("moves a State package withdrawal request to Package Withdrawn with the final business date", async () => {
    await consumeSmart("Pending - First Clock", "2026-11-02T18:00:00.000Z");
    applyStateAction("withdraw-package", "2026-11-02T19:00:00.000Z", {
      attachments: { officialWithdrawalLetter: attachment },
    });
    expect(document.stateStatus).toBe("Withdrawal Requested");
    expect(actions()).toEqual([]);
    await consumeSmart("Withdrawn", "2026-11-03T17:00:00.000Z");
    expect(document).toMatchObject({
      stateStatus: "Package Withdrawn",
      cmsStatus: "Package Withdrawn",
      finalDispositionDate: "2026-11-03T05:00:00.000Z",
      raiWithdrawEnabled: false,
      submissionDate: SUBMITTED_AT,
      makoChangedDate: "2026-11-02T19:00:00.000Z",
    });
    expect(actions()).toEqual([]);
    expect(history.map((entry) => entry.event)).toEqual([
      "new-chip-details-submission",
      "withdraw-package",
    ]);
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
