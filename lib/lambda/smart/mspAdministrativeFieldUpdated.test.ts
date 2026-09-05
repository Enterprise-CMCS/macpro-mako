import * as packageApi from "libs/api/package";
import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { opensearch, SEATOOL_STATUS, SMART_RECORD_TYPE } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { handleMspAdministrativeFieldUpdated } from "./mspAdministrativeFieldUpdated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import * as publishSmartIngestErrorModule from "./publishSmartIngestError";

const PACKAGE_ID = "MD-26-9000-SP1-A";
const EXTERNAL_ID = "a0vSL00000Clw03YAB";
const CREATED_AT = "2026-09-03T20:26:46.000Z";
const CREATED_TIMESTAMP = Date.parse(CREATED_AT);
const emptySearch = { hits: { hits: [] } };

const event = Object.freeze({
  spaWaiverId: EXTERNAL_ID,
  id: PACKAGE_ID,
  correlationId: "b2ca8c83-1271-4af9-8b77-a7eb2d7922b7",
  origin: "SMART",
  authority: "Medicaid SPA",
  status: "Pending - First Clock",
  createdAt: CREATED_AT,
  createdByUserId: "005SL00000InTKlYAN",
  createdByName: "Super1 Nag",
  createdByEmail: "smart@example.com",
  operationType: "MSP_ADMINISTRATIVE_FIELD_UPDATED",
  state: "Maryland",
  initialSubmissionDate: "2026-09-03",
  approvedEffectiveDate: null,
  proposedEffectiveDate: "2027-01-31",
  subject: "Must be ignored by this lane",
  rai: { raiRequestedDate: "2026-09-01" },
} satisfies SmartOnemacEvent);

const packageDocument = {
  id: PACKAGE_ID,
  origin: "OneMAC",
  authority: "Medicaid SPA",
  state: "MD",
  seatoolStatus: SEATOOL_STATUS.PENDING,
  cmsStatus: "Pending",
  stateStatus: "Under Review",
  submissionDate: "2026-09-01T04:00:00.000Z",
  proposedDate: "2027-01-01T05:00:00.000Z",
  approvedEffectiveDate: "2026-08-01T04:00:00.000Z",
  makoChangedDate: "2026-09-01T16:00:00.000Z",
  changedDate: "2026-09-01T16:00:00.000Z",
  statusDate: "2026-09-01T04:00:00.000Z",
  spaWaiverId: EXTERNAL_ID,
  subject: "Existing subject",
  raiRequestedDate: "2026-08-01T04:00:00.000Z",
  deleted: false,
} as opensearch.main.Document;

const packageById = (
  overrides: Partial<opensearch.main.Document> = {},
  id = PACKAGE_ID,
): Awaited<ReturnType<typeof os.getItem>> =>
  ({
    found: true,
    _id: id,
    _source: { ...packageDocument, id, ...overrides },
  }) as Awaited<ReturnType<typeof os.getItem>>;

const packageSearch = (
  overrides: Partial<opensearch.main.Document> = {},
  id = PACKAGE_ID,
): Awaited<ReturnType<typeof os.search>> =>
  ({
    hits: {
      hits: [{ _id: id, _source: { ...packageDocument, id, ...overrides } }],
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
  kafkaTimestamp: CREATED_TIMESTAMP,
  ...overrides,
});

const updateItemSpy = vi.spyOn(os, "updateItem");
const createItemSpy = vi.spyOn(os, "createItem");
const bulkUpdateDataSpy = vi.spyOn(os, "bulkUpdateData");
const getPackageChangelogSpy = vi.spyOn(packageApi, "getPackageChangelog");
const logErrorSpy = vi.spyOn(sink, "logError").mockImplementation(() => undefined);
const publishSmartIngestErrorSpy = vi
  .spyOn(publishSmartIngestErrorModule, "publishSmartIngestError")
  .mockResolvedValue(undefined);

describe("handleMspAdministrativeFieldUpdated", () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    process.env.osDomain = "https://search.example.test";
    process.env.indexNamespace = "test-";
    updateItemSpy.mockResolvedValue(undefined);
    createItemSpy.mockResolvedValue({ created: true });
    bulkUpdateDataSpy.mockResolvedValue(undefined);
    getPackageChangelogSpy.mockResolvedValue({ hits: { hits: [] } } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnvironment };
  });

  it("updates only administrative-owned fields and writes a deterministic admin change", async () => {
    await handleMspAdministrativeFieldUpdated(createContext());

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-changelog",
      [
        expect.objectContaining({
          id: `${PACKAGE_ID}-smart-administrative-${CREATED_TIMESTAMP}`,
          packageId: PACKAGE_ID,
          event: "update-values",
          isAdminChange: true,
          submitterName: event.createdByName,
        }),
      ],
      { throwOnBulkError: true },
    );
    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      PACKAGE_ID,
      expect.objectContaining({
        submissionDate: "2026-09-03T04:00:00.000Z",
        proposedDate: "2027-01-31T05:00:00.000Z",
        smartAdministrativeChangedAt: CREATED_AT,
      }),
    );
    const updates = updateItemSpy.mock.calls[0][3];
    expect(updates).not.toHaveProperty("approvedEffectiveDate");
    expect(updates).not.toHaveProperty("seatoolStatus");
    expect(updates).not.toHaveProperty("subject");
    expect(updates).not.toHaveProperty("raiRequestedDate");
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("does not create admin history when the owned values are unchanged", async () => {
    const unchanged = {
      submissionDate: "2026-09-03T04:00:00.000Z",
      proposedDate: "2027-01-31T05:00:00.000Z",
    };
    await handleMspAdministrativeFieldUpdated(
      createContext({
        existence: {
          mainById: packageById(unchanged),
          mainBySpaWaiverId: packageSearch(unchanged),
          changelogById: emptySearch,
        },
      }),
    );

    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).toHaveBeenCalledOnce();
  });

  it("renames by spaWaiverId, preserves the package, and copies its history", async () => {
    const oldId = "MD-26-9000-SP1";
    const oldPackage = { ...packageDocument, id: oldId } as opensearch.main.Document;
    getPackageChangelogSpy.mockResolvedValue({
      hits: {
        hits: [
          {
            _id: `${oldId}-1234`,
            _source: {
              id: `${oldId}-1234`,
              packageId: oldId,
              event: "new-medicaid-submission",
              timestamp: 1234,
            },
          },
        ],
      },
    } as never);

    await handleMspAdministrativeFieldUpdated(
      createContext({
        existence: {
          mainById: undefined,
          mainBySpaWaiverId: {
            hits: { hits: [{ _id: oldId, _source: oldPackage }] },
          } as Awaited<ReturnType<typeof os.search>>,
          changelogById: emptySearch,
        },
      }),
    );

    expect(getPackageChangelogSpy).toHaveBeenCalledWith(oldId);
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      [expect.objectContaining({ id: `${oldId}-del`, deleted: true })],
      { throwOnBulkError: true },
    );
    expect(createItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      expect.objectContaining({
        id: PACKAGE_ID,
        origin: "OneMAC",
        smartAdministrativePreviousId: oldId,
        deleted: false,
      }),
    );
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-changelog",
      expect.arrayContaining([
        expect.objectContaining({ id: `${PACKAGE_ID}-1234`, packageId: PACKAGE_ID }),
        expect.objectContaining({
          packageId: PACKAGE_ID,
          event: "update-id",
          idToBeUpdated: oldId,
        }),
      ]),
      { throwOnBulkError: true },
    );
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      [{ id: oldId, adminChangeType: "delete" }],
      { throwOnBulkError: true },
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it("does not overwrite a package occupying the new ID", async () => {
    const oldId = "MD-26-9000-SP1";
    const occupiedTarget = packageById({ spaWaiverId: "another-external-id" });
    await handleMspAdministrativeFieldUpdated(
      createContext({
        existence: {
          mainById: occupiedTarget,
          mainBySpaWaiverId: packageSearch({}, oldId),
          changelogById: emptySearch,
        },
      }),
    );

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION" }),
    );
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it("resumes a partial rename without creating a second target", async () => {
    const oldId = "MD-26-9000-SP1";
    const oldPackage = { ...packageDocument, id: oldId } as opensearch.main.Document;
    const partialTarget = {
      ...packageDocument,
      id: PACKAGE_ID,
      smartAdministrativePreviousId: oldId,
      smartAdministrativeChangedAt: CREATED_AT,
    } as opensearch.main.Document;

    await handleMspAdministrativeFieldUpdated(
      createContext({
        existence: {
          mainById: packageById(partialTarget),
          mainBySpaWaiverId: {
            hits: {
              hits: [
                { _id: oldId, _source: oldPackage },
                { _id: PACKAGE_ID, _source: partialTarget },
              ],
            },
          } as Awaited<ReturnType<typeof os.search>>,
          changelogById: emptySearch,
        },
      }),
    );

    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      PACKAGE_ID,
      expect.objectContaining({ id: PACKAGE_ID, smartAdministrativePreviousId: oldId }),
    );
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      [{ id: oldId, adminChangeType: "delete" }],
      { throwOnBulkError: true },
    );
  });

  it("skips stale administrative snapshots", async () => {
    const newerTimestamp = "2026-09-04T20:26:46.000Z";
    await handleMspAdministrativeFieldUpdated(
      createContext({
        existence: {
          mainById: packageById({ smartAdministrativeChangedAt: newerTimestamp }),
          mainBySpaWaiverId: packageSearch({ smartAdministrativeChangedAt: newerTimestamp }),
          changelogById: emptySearch,
        },
      }),
    );

    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("creates a hidden reservation when the administrative event arrives first", async () => {
    await handleMspAdministrativeFieldUpdated(
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
        submissionDate: "2026-09-03T04:00:00.000Z",
        proposedDate: "2027-01-31T05:00:00.000Z",
      }),
    );
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("rethrows changelog failures before changing the package so Kafka can retry", async () => {
    const outage = new Error("OpenSearch changelog unavailable");
    bulkUpdateDataSpy.mockRejectedValueOnce(outage);

    await expect(handleMspAdministrativeFieldUpdated(createContext())).rejects.toThrow(outage);
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("publishes validation for invalid calendar dates", async () => {
    const invalidEvent = {
      ...event,
      initialSubmissionDate: "2026-02-30",
    } as SmartOnemacEvent;
    await handleMspAdministrativeFieldUpdated(createContext({ event: invalidEvent }));

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION", payload: invalidEvent }),
    );
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: sink.ErrorType.VALIDATION }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
  });
});
