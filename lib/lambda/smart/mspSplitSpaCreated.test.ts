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
  correlationId: "",
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

const completedSplitDocument = (
  overrides: Partial<opensearch.main.Document> = {},
): Awaited<ReturnType<typeof os.getItem>> =>
  ({
    found: true,
    _id: SPLIT_ID,
    _source: {
      id: SPLIT_ID,
      origin: "SMART",
      smartRecordType: SMART_RECORD_TYPE.PACKAGE,
      spaWaiverId: SPLIT_EXTERNAL_ID,
      splitSpaId: SPLIT_ID,
      splitSpaWaiverId: SPLIT_EXTERNAL_ID,
      originalSpaId: ORIGINAL_ID,
      originalSpaWaiverId: ORIGINAL_EXTERNAL_ID,
      operationType: "MSP_SPLIT_SPA_CREATED",
      correlationId: "",
      ...overrides,
    },
  }) as Awaited<ReturnType<typeof os.getItem>>;

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

  it("finds an untouched OneMAC parent by ID and backfills its external identifier", async () => {
    const untouchedParent = {
      found: true,
      _id: ORIGINAL_ID,
      _source: {
        ...parentDocument,
        spaWaiverId: undefined,
      },
    } as Awaited<ReturnType<typeof os.getItem>>;
    searchSpy.mockResolvedValueOnce(emptySearch);
    getItemSpy.mockResolvedValueOnce(untouchedParent);

    await handleMspSplitSpaCreated(createContext());

    expect(getItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      ORIGINAL_ID,
    );
    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      ORIGINAL_ID,
      { spaWaiverId: ORIGINAL_EXTERNAL_ID },
    );
    expect(createItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      expect.objectContaining({
        id: SPLIT_ID,
        originalSpaId: ORIGINAL_ID,
        originalSpaWaiverId: ORIGINAL_EXTERNAL_ID,
      }),
    );
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("does not overwrite a conflicting external identifier on an ID-resolved parent", async () => {
    const conflictingParent = {
      found: true,
      _id: ORIGINAL_ID,
      _source: {
        ...parentDocument,
        spaWaiverId: "a0ncp000006Different",
      },
    } as Awaited<ReturnType<typeof os.getItem>>;
    searchSpy.mockResolvedValueOnce(emptySearch);
    getItemSpy.mockResolvedValueOnce(conflictingParent);

    await handleMspSplitSpaCreated(createContext());

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION" }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("does not split a deleted parent found by the ID fallback", async () => {
    const deletedParent = {
      found: true,
      _id: ORIGINAL_ID,
      _source: {
        ...parentDocument,
        deleted: true,
        spaWaiverId: undefined,
      },
    } as Awaited<ReturnType<typeof os.getItem>>;
    searchSpy.mockResolvedValueOnce(emptySearch);
    getItemSpy.mockResolvedValueOnce(deletedParent);

    await handleMspSplitSpaCreated(createContext());

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION" }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
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
          id: `${SPLIT_ID}-smart-split-${SPLIT_EXTERNAL_ID}`,
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
    const completedPackage = completedSplitDocument();

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

  it("accepts a stable replay when only the stored correlation ID is populated", async () => {
    const completedPackage = completedSplitDocument({ correlationId: "previous-correlation-id" });

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
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("rejects a stable replay when both nonempty correlation IDs conflict", async () => {
    const correlatedEvent = { ...event, correlationId: "incoming-correlation-id" };
    const completedPackage = completedSplitDocument({ correlationId: "different-correlation-id" });

    await handleMspSplitSpaCreated(
      createContext({
        event: correlatedEvent,
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

  it("accepts a matching completed split that wins a create race", async () => {
    createItemSpy.mockResolvedValueOnce({ created: false, reason: "version_conflict" });
    getItemSpy.mockResolvedValueOnce(completedSplitDocument());

    await handleMspSplitSpaCreated(createContext());

    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).toHaveBeenCalledOnce();
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("rejects a completed split ID that is linked to another original package", async () => {
    const completedPackage = completedSplitDocument({
      originalSpaId: "AL-26-2222",
      originalSpaWaiverId: "a0ncp000006Different",
    });

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

  it("publishes validation when neither parent identifier resolves", async () => {
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

  it("does not fall back by ID when another package owns the parent external identifier", async () => {
    searchSpy.mockResolvedValueOnce({
      hits: {
        hits: [
          {
            _id: "AL-26-2222",
            _source: {
              ...parentDocument,
              id: "AL-26-2222",
            },
          },
        ],
      },
    });

    await handleMspSplitSpaCreated(createContext());

    expect(getItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION" }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
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
