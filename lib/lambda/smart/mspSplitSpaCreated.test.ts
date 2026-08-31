import * as packageApi from "libs/api/package";
import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { opensearch, SEATOOL_STATUS, SMART_RECORD_TYPE } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { handleMspSplitSpaCreated } from "./mspSplitSpaCreated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import * as publishSmartIngestErrorModule from "./publishSmartIngestError";

const TOPIC_PARTITION = "aws.mulesoft.onemac.events-0";
const ORIGINAL_ID = "AL-26-1111";
const SPLIT_ID = "AL-26-1111-TEST";
const ORIGINAL_EXTERNAL_ID = "a0ncp000006UfblAAC";
const SPLIT_EXTERNAL_ID = "a0ncp000006WdfVAAS";
const CREATED_AT = "2026-08-17T16:37:12.000Z";
const CREATED_AT_EPOCH = Date.parse(CREATED_AT);

const event = Object.freeze({
  spaWaiverId: SPLIT_EXTERNAL_ID,
  id: SPLIT_ID,
  correlationId: "605d17ad-14de-421d-9567-57dbb1fdc913",
  origin: "SMART",
  authority: "Medicaid SPA",
  status: "Intake Needed",
  createdAt: CREATED_AT,
  createdByUserId: "005cp00000MvbMLAAZ",
  createdByName: "Todd Gooch",
  createdByEmail: "todd.gooch@icf.com",
  splitSpaId: SPLIT_ID,
  splitSpaWaiverId: SPLIT_EXTERNAL_ID,
  originalSpaWaiverId: ORIGINAL_EXTERNAL_ID,
  originalSpaId: ORIGINAL_ID,
  splitReason: "Testing Split for Allie",
  operationType: "MSP_SPLIT_SPA_CREATED",
} satisfies SmartOnemacEvent);

const parentDocument = {
  id: ORIGINAL_ID,
  origin: "OneMAC",
  authority: "Medicaid SPA",
  state: "AL",
  seatoolStatus: SEATOOL_STATUS.PENDING,
  cmsStatus: "Pending",
  stateStatus: "Under Review",
  submissionDate: "2026-07-01T12:00:00.000Z",
  makoChangedDate: "2026-07-02T12:00:00.000Z",
  changedDate: "2026-07-02T12:00:00.000Z",
  statusDate: "2026-07-02T12:00:00.000Z",
  submitterName: "Original Submitter",
  submitterEmail: "original@example.com",
  spaWaiverId: ORIGINAL_EXTERNAL_ID,
  deleted: false,
} as opensearch.main.Document;

const parentSearchResult = {
  hits: {
    hits: [{ _id: ORIGINAL_ID, _source: parentDocument }],
  },
};

const parentChangelog = {
  hits: {
    hits: [
      {
        _id: `${ORIGINAL_ID}-0001`,
        _source: {
          id: `${ORIGINAL_ID}-0001`,
          packageId: ORIGINAL_ID,
          event: "new-medicaid-submission",
          timestamp: 1782907200000,
          submitterName: "Original Submitter",
        },
      },
      {
        _id: `${ORIGINAL_ID}-after-split`,
        _source: {
          id: `${ORIGINAL_ID}-after-split`,
          packageId: ORIGINAL_ID,
          event: "upload-subsequent-documents",
          timestamp: CREATED_AT_EPOCH + 1,
          submitterName: "Later Submitter",
        },
      },
    ],
  },
} as opensearch.changelog.Response;

const emptySearch = { hits: { hits: [] } };
const createContext = (
  overrides: Partial<SmartOnemacEventContext> = {},
): SmartOnemacEventContext => ({
  event,
  existence: {
    mainById: undefined,
    mainBySpaWaiverId: emptySearch,
    changelogById: emptySearch,
  },
  topicPartition: TOPIC_PARTITION,
  ...overrides,
});

const searchSpy = vi.spyOn(os, "search");
const createItemSpy = vi.spyOn(os, "createItem");
const getItemSpy = vi.spyOn(os, "getItem");
const updateItemSpy = vi.spyOn(os, "updateItem");
const bulkUpdateDataSpy = vi.spyOn(os, "bulkUpdateData");
const getPackageChangelogSpy = vi.spyOn(packageApi, "getPackageChangelog");
const logErrorSpy = vi.spyOn(sink, "logError").mockImplementation(() => undefined);
const publishSmartIngestErrorSpy = vi
  .spyOn(publishSmartIngestErrorModule, "publishSmartIngestError")
  .mockResolvedValue(undefined);

describe("handleMspSplitSpaCreated", () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    process.env.osDomain = "https://search.example.test";
    process.env.indexNamespace = "test-";
    searchSpy.mockResolvedValue(parentSearchResult);
    createItemSpy.mockResolvedValue({ created: true });
    getItemSpy.mockResolvedValue(undefined);
    updateItemSpy.mockResolvedValue(undefined);
    bulkUpdateDataSpy.mockResolvedValue(undefined);
    getPackageChangelogSpy.mockResolvedValue(parentChangelog);
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnvironment };
  });

  it("clones the parent as a visible SMART package without changing its status", async () => {
    await handleMspSplitSpaCreated(createContext());

    expect(searchSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      expect.objectContaining({
        query: expect.objectContaining({
          bool: expect.objectContaining({
            must: [{ term: { spaWaiverId: ORIGINAL_EXTERNAL_ID } }],
          }),
        }),
      }),
    );
    expect(createItemSpy).toHaveBeenCalledOnce();
    expect(createItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      expect.objectContaining({
        id: SPLIT_ID,
        origin: "SMART",
        smartRecordType: SMART_RECORD_TYPE.PACKAGE,
        spaWaiverId: SPLIT_EXTERNAL_ID,
        correlationId: event.correlationId,
        originalSpaId: ORIGINAL_ID,
        originalSpaWaiverId: ORIGINAL_EXTERNAL_ID,
        splitReason: event.splitReason,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        cmsStatus: parentDocument.cmsStatus,
        stateStatus: parentDocument.stateStatus,
        submissionDate: parentDocument.submissionDate,
        makoChangedDate: CREATED_AT_EPOCH,
        changedDate: CREATED_AT_EPOCH,
        statusDate: CREATED_AT_EPOCH,
      }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("copies the split-time activity snapshot and adds a deterministic administrative event", async () => {
    await handleMspSplitSpaCreated(createContext());

    expect(getPackageChangelogSpy).toHaveBeenCalledWith(ORIGINAL_ID);
    expect(bulkUpdateDataSpy).toHaveBeenCalledOnce();
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-changelog",
      [
        expect.objectContaining({
          id: `${SPLIT_ID}-0001`,
          packageId: SPLIT_ID,
          event: "new-medicaid-submission",
          timestamp: 1782907200000,
        }),
        expect.objectContaining({
          id: `${SPLIT_ID}-smart-split-${event.correlationId}`,
          packageId: SPLIT_ID,
          event: "split-spa",
          timestamp: CREATED_AT_EPOCH,
          isAdminChange: true,
          changeMade: `Created split SPA ${SPLIT_ID} from ${ORIGINAL_ID}`,
          changeReason: event.splitReason,
          submitterName: event.createdByName,
        }),
      ],
      { throwOnBulkError: true },
    );
  });

  it("rethrows activity persistence failures so Kafka can retry", async () => {
    bulkUpdateDataSpy.mockRejectedValueOnce(new Error("bulk update failed"));

    await expect(handleMspSplitSpaCreated(createContext())).rejects.toThrow("bulk update failed");

    expect(createItemSpy).toHaveBeenCalledOnce();
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("promotes an existing hidden reservation instead of creating another document", async () => {
    const reservation = {
      found: true,
      _id: SPLIT_ID,
      _source: {
        id: SPLIT_ID,
        origin: "SMART",
        smartRecordType: SMART_RECORD_TYPE.RESERVATION,
        spaWaiverId: SPLIT_EXTERNAL_ID,
      },
    } as Awaited<ReturnType<typeof os.getItem>>;

    await handleMspSplitSpaCreated(
      createContext({
        existence: {
          mainById: reservation,
          mainBySpaWaiverId: emptySearch,
          changelogById: emptySearch,
        },
      }),
    );

    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      SPLIT_ID,
      expect.objectContaining({
        smartRecordType: SMART_RECORD_TYPE.PACKAGE,
        seatoolStatus: SEATOOL_STATUS.PENDING,
      }),
    );
  });

  it("does not overwrite a completed split package when Kafka retries", async () => {
    const completedPackage = {
      found: true,
      _id: SPLIT_ID,
      _source: {
        id: SPLIT_ID,
        origin: "SMART",
        smartRecordType: SMART_RECORD_TYPE.PACKAGE,
        spaWaiverId: SPLIT_EXTERNAL_ID,
        originalSpaId: ORIGINAL_ID,
        originalSpaWaiverId: ORIGINAL_EXTERNAL_ID,
      },
    } as Awaited<ReturnType<typeof os.getItem>>;

    await handleMspSplitSpaCreated(
      createContext({
        existence: {
          mainById: completedPackage,
          mainBySpaWaiverId: emptySearch,
          changelogById: emptySearch,
        },
      }),
    );

    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).toHaveBeenCalledOnce();
  });

  it("rejects a completed split ID that is linked to another original package", async () => {
    const completedPackage = {
      found: true,
      _id: SPLIT_ID,
      _source: {
        id: SPLIT_ID,
        origin: "SMART",
        smartRecordType: SMART_RECORD_TYPE.PACKAGE,
        spaWaiverId: SPLIT_EXTERNAL_ID,
        originalSpaId: "AL-26-2222",
        originalSpaWaiverId: "a0ncp000006Different",
      },
    } as Awaited<ReturnType<typeof os.getItem>>;

    await handleMspSplitSpaCreated(
      createContext({
        existence: {
          mainById: completedPackage,
          mainBySpaWaiverId: emptySearch,
          changelogById: emptySearch,
        },
      }),
    );

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION" }),
    );
    expect(searchSpy).not.toHaveBeenCalled();
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("publishes validation when required Split SPA fields are missing", async () => {
    const invalidEvent = { ...event, originalSpaWaiverId: undefined } as SmartOnemacEvent;

    await handleMspSplitSpaCreated(createContext({ event: invalidEvent }));

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "VALIDATION",
        payload: invalidEvent,
      }),
    );
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: sink.ErrorType.VALIDATION }),
    );
    expect(searchSpy).not.toHaveBeenCalled();
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("publishes validation when the external parent identifier is missing or ambiguous", async () => {
    searchSpy.mockResolvedValueOnce(emptySearch);

    await handleMspSplitSpaCreated(createContext());

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "VALIDATION",
        payload: event,
      }),
    );
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("does not overwrite a non-reservation package that already uses the split ID", async () => {
    const collision = {
      found: true,
      _id: SPLIT_ID,
      _source: {
        id: SPLIT_ID,
        origin: "OneMAC",
        spaWaiverId: SPLIT_EXTERNAL_ID,
      },
    } as Awaited<ReturnType<typeof os.getItem>>;

    await handleMspSplitSpaCreated(
      createContext({
        existence: {
          mainById: collision,
          mainBySpaWaiverId: emptySearch,
          changelogById: emptySearch,
        },
      }),
    );

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION" }),
    );
    expect(searchSpy).not.toHaveBeenCalled();
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
  });
});
