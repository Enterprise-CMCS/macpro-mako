import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { TEST_REVIEWER_USER, TEST_STATE_SUBMITTER_USER } from "mocks";
import { Action, getStatus, opensearch, SEATOOL_STATUS, SMART_RECORD_TYPE } from "shared-types";
import { getAvailableActions } from "shared-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { handleMspStatusUpdated } from "./mspStatusUpdated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import * as errors from "./publishSmartIngestError";

const PACKAGE_ID = "OH-26-1112-CHIP";
const EXTERNAL_ID = "chip-smart-record";
const CHANGED_AT = "2026-11-12T17:00:00.123Z";
const EMPTY_SEARCH = { hits: { hits: [] } };

const event: SmartOnemacEvent = {
  id: PACKAGE_ID,
  spaWaiverId: EXTERNAL_ID,
  correlationId: "chip-status-correlation",
  origin: "SMART",
  authority: "CHIP SPA",
  operationType: "MSP_STATUS_UPDATED",
  createdAt: "2026-11-12T17:00:00.000Z",
  statusChangedAt: CHANGED_AT,
  statusDate: "2026-11-12",
  status: "Pending - First Clock",
  // Deliberately stale details echoed on an unrelated status snapshot.
  subject: "Old subject",
  description: "Old description",
  initialSubmissionDate: "2026-11-12",
  proposedEffectiveDate: "2026-12-31",
  typeSelections: [],
  rai: { formalRaiRequested: false, raiRequestedDate: null },
};

const packageDocument = {
  id: PACKAGE_ID,
  authority: "CHIP SPA",
  origin: "OneMAC",
  state: "OH",
  spaWaiverId: EXTERNAL_ID,
  correlationId: event.correlationId,
  seatoolStatus: SEATOOL_STATUS.SUBMITTED,
  ...getStatus(SEATOOL_STATUS.SUBMITTED),
  submissionDate: "2026-11-01T18:00:00.000Z",
  makoChangedDate: "2026-11-01T18:00:00.000Z",
  changedDate: "2026-11-01T18:00:00.000Z",
  subject: "Current subject",
  description: "Current description",
  initialIntakeNeeded: true,
  deleted: false,
  locked: true,
} as unknown as opensearch.main.Document;

// The persisted package can contain a response date even though the legacy
// Document intersection also includes the withdrawal transform's null result.
interface PackageOverrides extends Omit<Partial<opensearch.main.Document>, "raiReceivedDate"> {
  raiReceivedDate?: string | null;
}

const packageResult = (overrides: PackageOverrides = {}) =>
  ({
    found: true,
    _id: PACKAGE_ID,
    _source: { ...packageDocument, ...overrides },
  }) as unknown as NonNullable<Awaited<ReturnType<typeof os.getItem>>>;

const context = (
  eventOverrides: Partial<SmartOnemacEvent> = {},
  documentOverrides: PackageOverrides = {},
): SmartOnemacEventContext => {
  const found = packageResult(documentOverrides);
  return {
    event: { ...event, ...eventOverrides },
    topicPartition: "aws.mulesoft.onemac.events-0",
    kafkaKey: PACKAGE_ID,
    existence: {
      mainById: found,
      mainBySpaWaiverId: { hits: { hits: [found] } } as Awaited<ReturnType<typeof os.search>>,
      changelogById: EMPTY_SEARCH,
    },
  };
};

const updateSpy = vi.spyOn(os, "updateItem");
const createSpy = vi.spyOn(os, "createItem");
const getSpy = vi.spyOn(os, "getItem");
const bulkSpy = vi.spyOn(os, "bulkUpdateData");
const errorSpy = vi.spyOn(errors, "publishSmartIngestError");
vi.spyOn(sink, "logError").mockImplementation(() => undefined);
vi.spyOn(console, "info").mockImplementation(() => undefined);

describe("CHIP MSP_STATUS_UPDATED", () => {
  beforeEach(() => {
    vi.stubEnv("osDomain", "https://search.example.test");
    vi.stubEnv("indexNamespace", "test-");
    updateSpy.mockReset().mockResolvedValue(undefined);
    createSpy.mockReset().mockResolvedValue({ created: true });
    getSpy.mockReset();
    bulkSpy.mockReset().mockResolvedValue(undefined);
    errorSpy.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => vi.unstubAllEnvs());

  it("updates status dates without overwriting details, State dates, or Latest Package Activity", async () => {
    await handleMspStatusUpdated(context());

    const updates = updateSpy.mock.calls[0][3];
    expect(updates).toMatchObject({
      seatoolStatus: SEATOOL_STATUS.PENDING,
      stateStatus: "Under Review",
      cmsStatus: "Pending",
      statusDate: "2026-11-12T05:00:00.000Z",
      smartStatusChangedAt: CHANGED_AT,
      initialIntakeNeeded: false,
      locked: false,
    });
    for (const field of [
      "id",
      "authority",
      "origin",
      "state",
      "submissionDate",
      "makoChangedDate",
      "subject",
      "description",
      "types",
      "subTypes",
      "proposedDate",
      "approvedEffectiveDate",
      "raiReceivedDate",
      "raiWithdrawnDate",
      "reviewTeam",
      "leadAnalystName",
    ]) {
      expect(updates).not.toHaveProperty(field);
    }
    expect(bulkSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it.each([
    "Pending - First Clock",
    "Pending - Second Clock",
    "Pending Concurrence",
    "Pending - Concurrence",
    "Pending Approval",
    "Pending - Approval",
    "Pending Disapproval",
    "Pending - Disapproval",
  ])("offers upload and withdrawal for State users in %s", async (status) => {
    await handleMspStatusUpdated(context({ status }));
    const document = { ...packageDocument, ...updateSpy.mock.calls[0][3] };
    expect(document.stateStatus).toBe("Under Review");
    expect(getAvailableActions(TEST_STATE_SUBMITTER_USER, document)).toEqual([
      Action.UPLOAD_SUBSEQUENT_DOCUMENTS,
      Action.WITHDRAW_PACKAGE,
    ]);
    expect(getAvailableActions(TEST_REVIEWER_USER, document)).not.toContain(
      Action.UPLOAD_SUBSEQUENT_DOCUMENTS,
    );
  });

  it.each(["Approved", "Disapproved", "Withdrawn"])(
    "sets final disposition for %s and closes State actions",
    async (status) => {
      await handleMspStatusUpdated(context({ status }, { raiWithdrawEnabled: true }));
      const updates = updateSpy.mock.calls[0][3];
      expect(updates).toMatchObject({
        finalDispositionDate: "2026-11-12T05:00:00.000Z",
        raiWithdrawEnabled: false,
        secondClock: false,
      });
      expect(
        getAvailableActions(TEST_STATE_SUBMITTER_USER, { ...packageDocument, ...updates }),
      ).toEqual([]);
    },
  );

  it("clears final disposition when SMART returns the package to an active status", async () => {
    await handleMspStatusUpdated(context({}, { finalDispositionDate: "2026-11-10T05:00:00.000Z" }));
    expect(updateSpy.mock.calls[0][3]).toHaveProperty("finalDispositionDate", null);
  });

  it("preserves State-owned RAI dates echoed as null or older values", async () => {
    await handleMspStatusUpdated(
      context(
        {
          status: "Pending - Second Clock",
          rai: {
            formalRaiRequested: true,
            raiRequestedDate: "2026-11-02",
            raiResponseReceivedDate: "2026-11-03",
            raiResponseWithdrawnDate: null,
          },
        },
        {
          raiReceivedDate: "2026-11-11T18:15:00.000Z",
          raiWithdrawnDate: "2026-11-10T15:00:00.000Z",
        },
      ),
    );
    expect(updateSpy.mock.calls[0][3]).toMatchObject({
      secondClock: true,
      raiRequestedDate: "2026-11-02T05:00:00.000Z",
    });
    expect(updateSpy.mock.calls[0][3]).not.toHaveProperty("raiReceivedDate");
    expect(updateSpy.mock.calls[0][3]).not.toHaveProperty("raiWithdrawnDate");
  });

  it.each([
    ["authority mismatch", { authority: "Medicaid SPA" }],
    ["deleted package", { deleted: true }],
    ["different external ID", { spaWaiverId: "another-smart-record" }],
  ])("reports %s without changing the package", async (_description, overrides) => {
    const input = context({}, overrides);
    input.existence.mainBySpaWaiverId = EMPTY_SEARCH;
    await handleMspStatusUpdated(input);
    expect(updateSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({ errorCode: "VALIDATION" }));
  });

  it("rejects an external ID linked to multiple active packages", async () => {
    const input = context();
    input.existence.mainBySpaWaiverId = {
      hits: {
        hits: [
          packageResult(),
          {
            ...packageResult(),
            _id: "OH-26-OTHER",
            _source: { ...packageDocument, id: "OH-26-OTHER" },
          },
        ],
      },
    } as Awaited<ReturnType<typeof os.search>>;
    await handleMspStatusUpdated(input);
    expect(updateSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("backfills an unlinked matching package without replacing its origin", async () => {
    const input = context({}, { spaWaiverId: undefined, correlationId: undefined });
    input.existence.mainBySpaWaiverId = EMPTY_SEARCH;
    await handleMspStatusUpdated(input);
    expect(updateSpy.mock.calls[0][3]).toMatchObject({
      spaWaiverId: EXTERNAL_ID,
      correlationId: event.correlationId,
    });
    expect(updateSpy.mock.calls[0][3]).not.toHaveProperty("origin");
  });

  it("does not regress a newer status", async () => {
    await handleMspStatusUpdated(context({}, { smartStatusChangedAt: "2026-11-13T17:00:00.000Z" }));
    expect(updateSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("does not unlock or overwrite a State response when its issued-RAI event is replayed", async () => {
    await handleMspStatusUpdated(
      context(
        { status: "Pending RAI" },
        {
          smartStatus: "Pending RAI",
          smartStatusChangedAt: CHANGED_AT,
          raiReceivedDate: "2026-11-12T18:00:00.000Z",
          locked: true,
        },
      ),
    );
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("reports a conflicting status at the same timestamp", async () => {
    await handleMspStatusUpdated(
      context({}, { smartStatus: "Approved", smartStatusChangedAt: CHANGED_AT }),
    );
    expect(updateSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("creates a CHIP reservation when the status arrives first", async () => {
    await handleMspStatusUpdated({
      ...context(),
      existence: {
        mainById: undefined,
        mainBySpaWaiverId: EMPTY_SEARCH,
        changelogById: EMPTY_SEARCH,
      },
    });
    expect(createSpy.mock.calls[0][2]).toMatchObject({
      authority: "CHIP SPA",
      origin: "SMART",
      smartRecordType: SMART_RECORD_TYPE.RESERVATION,
      smartStatus: event.status,
    });
  });

  it.each([
    ["a newer status", { smartStatusChangedAt: "2026-11-13T17:00:00.000Z" }],
    [
      "a replay after a State response",
      { smartStatus: event.status, smartStatusChangedAt: CHANGED_AT, locked: true },
    ],
    ["another authority", { authority: "Medicaid SPA" }],
    ["another external ID", { spaWaiverId: "another-record" }],
    ["a deleted package", { deleted: true }],
  ])("rechecks %s after losing a reservation-create race", async (_description, overrides) => {
    createSpy.mockResolvedValue({ created: false, reason: "version_conflict" });
    getSpy.mockResolvedValue(packageResult(overrides));
    await handleMspStatusUpdated({
      ...context(),
      existence: {
        mainById: undefined,
        mainBySpaWaiverId: EMPTY_SEARCH,
        changelogById: EMPTY_SEARCH,
      },
    });
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("retries when a create conflict cannot yet be read", async () => {
    createSpy.mockResolvedValue({ created: false, reason: "version_conflict" });
    getSpy.mockResolvedValue(undefined);
    await expect(
      handleMspStatusUpdated({
        ...context(),
        existence: {
          mainById: undefined,
          mainBySpaWaiverId: EMPTY_SEARCH,
          changelogById: EMPTY_SEARCH,
        },
      }),
    ).rejects.toThrow("could not be resolved");
  });

  it("uses the GET snapshot and its version when search is behind", async () => {
    const input = context({}, { smartStatusChangedAt: "2026-11-13T17:00:00.000Z" });
    input.existence.mainBySpaWaiverId = { hits: { hits: [packageResult()] } } as Awaited<
      ReturnType<typeof os.search>
    >;
    await handleMspStatusUpdated(input);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("uses optimistic concurrency so a concurrent State action forces a retry", async () => {
    const input = context();
    input.existence.mainById = { ...packageResult(), _seq_no: 7, _primary_term: 1 };
    const conflict = new Error("version_conflict_engine_exception");
    updateSpy.mockRejectedValueOnce(conflict);
    await expect(handleMspStatusUpdated(input)).rejects.toBe(conflict);
    expect(updateSpy).toHaveBeenCalledWith(
      expect.any(String),
      "test-main",
      PACKAGE_ID,
      expect.any(Object),
      { ifSeqNo: 7, ifPrimaryTerm: 1 },
    );
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it.each(["Pending Third Clock", "CHIP Approved"])(
    "reports unsupported status %s",
    async (status) => {
      await handleMspStatusUpdated(context({ status }));
      expect(updateSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    },
  );
});
