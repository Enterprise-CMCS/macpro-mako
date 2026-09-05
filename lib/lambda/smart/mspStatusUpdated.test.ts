import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { opensearch, SEATOOL_STATUS, SMART_RECORD_TYPE } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { handleMspStatusUpdated } from "./mspStatusUpdated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import * as publishSmartIngestErrorModule from "./publishSmartIngestError";

const PACKAGE_ID = "MD-26-9000-SP1-A";
const EXTERNAL_ID = "a0vSL00000Clw03YAB";
const STATUS_CHANGED_AT = "2026-09-03T20:26:46.223Z";
const emptySearch = { hits: { hits: [] } };

const event = Object.freeze({
  spaWaiverId: EXTERNAL_ID,
  id: PACKAGE_ID,
  correlationId: "b2ca8c83-1271-4af9-8b77-a7eb2d7922b7",
  origin: "SMART",
  authority: "Medicaid SPA",
  status: "Pending - First Clock",
  createdAt: "2026-09-03T20:26:46.000Z",
  createdByUserId: "005SL00000InTKlYAN",
  createdByName: "Super1 Nag",
  createdByEmail: "smart@example.com",
  operationType: "MSP_STATUS_UPDATED",
  statusChangedAt: STATUS_CHANGED_AT,
  statusDate: "2026-09-03",
  subject: "Test Subject",
  description: "Test Description",
  rai: {
    formalRaiRequested: false,
    raiRequestedDate: null,
    raiResponseReceivedDate: null,
    raiResponseWithdrawnDate: null,
  },
  typeSelections: [
    {
      typeSelectionId: "a1ESL000002qasD2AQ",
      type: "Eligibility",
      subType: "Community Engagement",
      isTypeActive: true,
      isSubTypeActive: true,
    },
    {
      typeSelectionId: "a1ESL000002qasE2AQ",
      type: "Eligibility",
      subType: "Inactive subtype",
      isTypeActive: true,
      isSubTypeActive: false,
    },
  ],
} satisfies SmartOnemacEvent);

const packageDocument = {
  id: PACKAGE_ID,
  origin: "OneMAC",
  authority: "Medicaid SPA",
  state: "MD",
  seatoolStatus: SEATOOL_STATUS.SUBMITTED,
  cmsStatus: "Submitted - Intake Needed",
  stateStatus: "Submitted",
  submissionDate: "2026-09-01T04:00:00.000Z",
  makoChangedDate: "2026-09-01T16:00:00.000Z",
  changedDate: "2026-09-01T16:00:00.000Z",
  statusDate: "2026-09-01T04:00:00.000Z",
  spaWaiverId: EXTERNAL_ID,
  correlationId: event.correlationId,
  initialIntakeNeeded: true,
  locked: true,
  deleted: false,
} as opensearch.main.Document;

const packageById = (
  overrides: Partial<opensearch.main.Document> = {},
): Awaited<ReturnType<typeof os.getItem>> =>
  ({
    found: true,
    _id: PACKAGE_ID,
    _source: { ...packageDocument, ...overrides },
  }) as Awaited<ReturnType<typeof os.getItem>>;

const packageSearch = (
  overrides: Partial<opensearch.main.Document> = {},
): Awaited<ReturnType<typeof os.search>> =>
  ({
    hits: {
      hits: [{ _id: PACKAGE_ID, _source: { ...packageDocument, ...overrides } }],
    },
  }) as Awaited<ReturnType<typeof os.search>>;

const createContext = (
  overrides: Partial<SmartOnemacEventContext> = {},
): SmartOnemacEventContext => ({
  event,
  existence: {
    mainById: packageById(),
    mainBySpaWaiverId: packageSearch(),
    changelogById: emptySearch,
  },
  topicPartition: "aws.mulesoft.onemac.events-0",
  kafkaKey: PACKAGE_ID,
  kafkaOffset: 42,
  kafkaTimestamp: Date.parse(event.createdAt),
  ...overrides,
});

const updateItemSpy = vi.spyOn(os, "updateItem");
const createItemSpy = vi.spyOn(os, "createItem");
const bulkUpdateDataSpy = vi.spyOn(os, "bulkUpdateData");
const logErrorSpy = vi.spyOn(sink, "logError").mockImplementation(() => undefined);
const publishSmartIngestErrorSpy = vi
  .spyOn(publishSmartIngestErrorModule, "publishSmartIngestError")
  .mockResolvedValue(undefined);

describe("handleMspStatusUpdated", () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    process.env.osDomain = "https://search.example.test";
    process.env.indexNamespace = "test-";
    updateItemSpy.mockResolvedValue(undefined);
    createItemSpy.mockResolvedValue({ created: true });
    bulkUpdateDataSpy.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnvironment };
  });

  it("maps First Clock and updates only status-owned fields", async () => {
    await handleMspStatusUpdated(createContext());

    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      PACKAGE_ID,
      expect.objectContaining({
        seatoolStatus: SEATOOL_STATUS.PENDING,
        stateStatus: "Under Review",
        cmsStatus: "Pending",
        smartStatus: "Pending - First Clock",
        smartStatusChangedAt: STATUS_CHANGED_AT,
        statusDate: "2026-09-03T04:00:00.000Z",
        initialIntakeNeeded: false,
        locked: false,
        secondClock: false,
        subject: event.subject,
        description: event.description,
        types: [{ SPA_TYPE_ID: expect.any(Number), SPA_TYPE_NAME: "Eligibility" }],
        subTypes: [{ TYPE_ID: expect.any(Number), TYPE_NAME: "Community Engagement" }],
      }),
    );
    const updates = updateItemSpy.mock.calls[0][3];
    expect(updates).not.toHaveProperty("origin");
    expect(updates).not.toHaveProperty("state");
    expect(updates).not.toHaveProperty("submissionDate");
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("maps Second Clock, overwrites concrete SMART RAI dates, and preserves null dates", async () => {
    const secondClockEvent = {
      ...event,
      status: "Pending - Second Clock",
      rai: {
        formalRaiRequested: false,
        raiRequestedDate: "2026-08-01",
        raiResponseReceivedDate: "2026-08-20",
        raiResponseWithdrawnDate: null,
      },
    };

    await handleMspStatusUpdated(
      createContext({
        event: secondClockEvent,
        existence: {
          mainById: packageById({ raiWithdrawnDate: "2026-07-15T04:00:00.000Z" }),
          mainBySpaWaiverId: packageSearch({
            raiWithdrawnDate: "2026-07-15T04:00:00.000Z",
          }),
          changelogById: emptySearch,
        },
      }),
    );

    expect(updateItemSpy.mock.calls[0][3]).toEqual(
      expect.objectContaining({
        seatoolStatus: SEATOOL_STATUS.PENDING,
        secondClock: true,
        raiRequestedDate: "2026-08-01T04:00:00.000Z",
        raiReceivedDate: "2026-08-20T04:00:00.000Z",
      }),
    );
    expect(updateItemSpy.mock.calls[0][3]).not.toHaveProperty("raiWithdrawnDate");
  });

  it("clears prior response state when SMART issues a new Formal RAI", async () => {
    const pendingRaiEvent = {
      ...event,
      status: "Pending RAI",
      rai: {
        formalRaiRequested: true,
        raiRequestedDate: "2026-09-03",
        raiResponseReceivedDate: null,
        raiResponseWithdrawnDate: null,
      },
    };

    await handleMspStatusUpdated(
      createContext({
        event: pendingRaiEvent,
        existence: {
          mainById: packageById({
            raiReceivedDate: "2026-08-20T04:00:00.000Z",
            raiWithdrawnDate: "2026-08-21T04:00:00.000Z",
            raiWithdrawEnabled: true,
          }),
          mainBySpaWaiverId: packageSearch({
            raiReceivedDate: "2026-08-20T04:00:00.000Z",
            raiWithdrawnDate: "2026-08-21T04:00:00.000Z",
            raiWithdrawEnabled: true,
          }),
          changelogById: emptySearch,
        },
      }),
    );

    expect(updateItemSpy.mock.calls[0][3]).toEqual(
      expect.objectContaining({
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        stateStatus: "RAI Issued",
        raiRequestedDate: "2026-09-03T04:00:00.000Z",
        raiReceivedDate: null,
        raiWithdrawnDate: null,
        raiWithdrawEnabled: false,
      }),
    );
  });

  it("sets the final disposition date and disables RAI withdrawal for final statuses", async () => {
    await handleMspStatusUpdated(createContext({ event: { ...event, status: "Disapproved" } }));

    expect(updateItemSpy.mock.calls[0][3]).toEqual(
      expect.objectContaining({
        seatoolStatus: SEATOOL_STATUS.DISAPPROVED,
        stateStatus: "Disapproved",
        finalDispositionDate: "2026-09-03T04:00:00.000Z",
        raiWithdrawEnabled: false,
      }),
    );
  });

  it("does not regress a newer SMART status event", async () => {
    const newerTimestamp = "2026-09-04T20:26:46.223Z";
    await handleMspStatusUpdated(
      createContext({
        existence: {
          mainById: packageById({ smartStatusChangedAt: newerTimestamp }),
          mainBySpaWaiverId: packageSearch({ smartStatusChangedAt: newerTimestamp }),
          changelogById: emptySearch,
        },
      }),
    );

    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(createItemSpy).not.toHaveBeenCalled();
  });

  it("publishes validation for conflicting statuses at the same timestamp", async () => {
    await handleMspStatusUpdated(
      createContext({
        existence: {
          mainById: packageById({
            smartStatusChangedAt: STATUS_CHANGED_AT,
            smartStatus: "Approved",
          }),
          mainBySpaWaiverId: packageSearch({
            smartStatusChangedAt: STATUS_CHANGED_AT,
            smartStatus: "Approved",
          }),
          changelogById: emptySearch,
        },
      }),
    );

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION", payload: event }),
    );
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: sink.ErrorType.VALIDATION }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it("creates a hidden reservation when the status arrives before the package", async () => {
    await handleMspStatusUpdated(
      createContext({
        existence: {
          mainById: undefined,
          mainBySpaWaiverId: emptySearch,
          changelogById: emptySearch,
        },
      }),
    );

    expect(createItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      expect.objectContaining({
        id: PACKAGE_ID,
        origin: "SMART",
        smartRecordType: SMART_RECORD_TYPE.RESERVATION,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        smartStatus: "Pending - First Clock",
      }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it("publishes validation for an unknown status instead of writing", async () => {
    const invalidEvent = { ...event, status: "Pending Third Clock" } as SmartOnemacEvent;
    await handleMspStatusUpdated(createContext({ event: invalidEvent }));

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION", payload: invalidEvent }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(createItemSpy).not.toHaveBeenCalled();
  });

  it("rethrows OpenSearch failures so Kafka retries the event", async () => {
    const outage = new Error("OpenSearch unavailable");
    updateItemSpy.mockRejectedValueOnce(outage);

    await expect(handleMspStatusUpdated(createContext())).rejects.toThrow(outage);
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });
});
