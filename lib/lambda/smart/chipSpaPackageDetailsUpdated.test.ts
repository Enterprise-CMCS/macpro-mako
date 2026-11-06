import * as packageApi from "libs/api/package";
import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { opensearch, SEATOOL_STATUS, SMART_RECORD_TYPE } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handleChipSpaPackageDetailsUpdated } from "./chipSpaPackageDetailsUpdated";
import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import * as publishSmartIngestErrorModule from "./publishSmartIngestError";

const PACKAGE_ID = "CA-26-1105-CHIP";
const EXTERNAL_ID = "a0nTESTCHIP261105";
const CREATED_AT = "2026-11-05T16:59:00.000Z";
const STATUS_CHANGED_AT = "2026-11-05T17:00:00.123Z";
const STATUS_CHANGED_TIMESTAMP = Date.parse(STATUS_CHANGED_AT);
const emptySearch = { hits: { hits: [] } };

const typeSelections = [
  {
    typeSelectionId: "selection-eligibility-magi",
    type: "Eligibility",
    subType: "MAGI",
    isTypeActive: true,
    isSubTypeActive: true,
  },
  {
    typeSelectionId: "selection-eligibility-chip",
    type: "Eligibility",
    subType: "CHIP Eligibility",
    isTypeActive: true,
    isSubTypeActive: true,
  },
];

const event = Object.freeze({
  spaWaiverId: EXTERNAL_ID,
  id: PACKAGE_ID,
  correlationId: "9fb54847-2eca-465d-b6a3-253ccfc565d8",
  origin: "SMART",
  authority: "CHIP SPA",
  status: "Pending - First Clock",
  createdAt: CREATED_AT,
  createdByUserId: "005SMARTUSER",
  createdByName: "CHIP Super User",
  createdByEmail: "chip.super@example.com",
  operationType: "MSP_ADMINISTRATIVE_FIELD_UPDATED",
  state: "California",
  initialSubmissionDate: "2026-11-05",
  statusChangedAt: STATUS_CHANGED_AT,
  subject: "Updated CHIP subject",
  description: "Updated CHIP description",
  approvedEffectiveDate: "2026-12-01",
  proposedEffectiveDate: "2027-01-31",
  typeSelections,
  // These snapshot fields are outside this event's ownership.
  rai: { raiRequestedDate: "2026-10-01" },
  submissionReviewTeam: [{ fullName: "Must be ignored" }],
} satisfies SmartOnemacEvent);

const packageDocument = {
  id: PACKAGE_ID,
  origin: "OneMAC",
  authority: "CHIP SPA",
  state: "CA",
  seatoolStatus: SEATOOL_STATUS.PENDING,
  cmsStatus: "Pending",
  stateStatus: "Under Review",
  submissionDate: "2026-11-04T05:00:00.000Z",
  proposedDate: "2027-01-01T05:00:00.000Z",
  approvedEffectiveDate: "2026-11-01T04:00:00.000Z",
  makoChangedDate: "2026-11-04T16:00:00.000Z",
  changedDate: "2026-11-04T16:00:00.000Z",
  statusDate: "2026-11-04T05:00:00.000Z",
  spaWaiverId: EXTERNAL_ID,
  subject: "Existing CHIP subject",
  description: "Existing CHIP description",
  types: [{ SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Administration" }],
  subTypes: [{ TYPE_ID: 2, TYPE_NAME: "Reporting" }],
  raiRequestedDate: "2026-10-01T04:00:00.000Z",
  leadAnalystName: "Existing CPOC",
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
  kafkaTimestamp: Date.parse(CREATED_AT),
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

describe("handleChipSpaPackageDetailsUpdated", () => {
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

  it("updates only approved fields and records only administrative-owned changes", async () => {
    await handleChipSpaPackageDetailsUpdated(createContext());

    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      PACKAGE_ID,
      expect.objectContaining({
        subject: event.subject,
        description: event.description,
        submissionDate: "2026-11-05T05:00:00.000Z",
        proposedDate: "2027-01-31T05:00:00.000Z",
        approvedEffectiveDate: "2026-12-01T05:00:00.000Z",
        smartPackageDetailsChangedAt: STATUS_CHANGED_AT,
        makoChangedDate: STATUS_CHANGED_AT,
        changedDate: STATUS_CHANGED_AT,
      }),
    );
    const updates = updateItemSpy.mock.calls[0][3];
    expect(updates.types).toEqual([expect.objectContaining({ SPA_TYPE_NAME: "Eligibility" })]);
    expect(updates.subTypes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ TYPE_NAME: "MAGI" }),
        expect.objectContaining({ TYPE_NAME: "CHIP Eligibility" }),
      ]),
    );
    expect(updates).not.toHaveProperty("origin");
    expect(updates).not.toHaveProperty("seatoolStatus");
    expect(updates).not.toHaveProperty("raiRequestedDate");
    expect(updates).not.toHaveProperty("leadAnalystName");

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-changelog",
      [
        expect.objectContaining({
          id: `${PACKAGE_ID}-smart-chip-details-${STATUS_CHANGED_TIMESTAMP}`,
          packageId: PACKAGE_ID,
          event: "update-values",
          isAdminChange: true,
          changeMade: "Initial Submission Date changed from 2026-11-04 to 2026-11-05",
          changeReason:
            "This package was updated in OneMAC to reflect an authorized package detail change made in SMART by CHIP Super User.",
        }),
      ],
      { throwOnBulkError: true },
    );
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("clears nullable text and an explicitly empty type snapshot without clearing dates", async () => {
    const currentValues = {
      submissionDate: "2026-11-05T16:15:00.000Z",
      proposedDate: "2027-01-31T05:00:00.000Z",
      approvedEffectiveDate: "2026-12-01T05:00:00.000Z",
    };
    await handleChipSpaPackageDetailsUpdated(
      createContext({
        event: {
          ...event,
          subject: null,
          description: null,
          typeSelections: [],
          proposedEffectiveDate: null,
          approvedEffectiveDate: null,
        } as SmartOnemacEvent,
        existence: {
          mainById: packageById(currentValues),
          mainBySpaWaiverId: packageSearch(currentValues),
          changelogById: emptySearch,
        },
      }),
    );

    const updates = updateItemSpy.mock.calls[0][3];
    expect(updates).toMatchObject({ subject: null, description: null, types: [], subTypes: [] });
    expect(updates).not.toHaveProperty("proposedDate");
    expect(updates).not.toHaveProperty("approvedEffectiveDate");
    expect(updates.makoChangedDate).toBe(STATUS_CHANGED_AT);
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("tracks a newer unchanged snapshot without moving Latest Package Activity", async () => {
    const unchanged = {
      submissionDate: "2026-11-05T16:15:00.000Z",
      proposedDate: "2027-01-31T00:00:00.000Z",
      approvedEffectiveDate: "2026-12-01T00:00:00.000Z",
      subject: event.subject,
      description: event.description,
      types: [{ SPA_TYPE_ID: 5, SPA_TYPE_NAME: "Eligibility" }],
      subTypes: [
        { TYPE_ID: 6, TYPE_NAME: "CHIP Eligibility" },
        { TYPE_ID: 7, TYPE_NAME: "MAGI" },
      ],
    };
    await handleChipSpaPackageDetailsUpdated(
      createContext({
        existence: {
          mainById: packageById(unchanged),
          mainBySpaWaiverId: packageSearch(unchanged),
          changelogById: emptySearch,
        },
      }),
    );

    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      PACKAGE_ID,
      {
        smartPackageDetailsChangedAt: STATUS_CHANGED_AT,
        operationType: "MSP_ADMINISTRATIVE_FIELD_UPDATED",
        correlationId: event.correlationId,
      },
    );
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("skips stale package-detail snapshots", async () => {
    const newerTimestamp = "2026-11-05T18:00:00.000Z";
    await handleChipSpaPackageDetailsUpdated(
      createContext({
        existence: {
          mainById: packageById({ smartPackageDetailsChangedAt: newerTimestamp }),
          mainBySpaWaiverId: packageSearch({ smartPackageDetailsChangedAt: newerTimestamp }),
          changelogById: emptySearch,
        },
      }),
    );

    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("renames by stable spaWaiverId, changes state, preserves origin, and copies history", async () => {
    const oldId = PACKAGE_ID;
    const newId = "MD-26-1105-CHIP";
    const sourceValues = {
      submissionDate: "2026-11-05T16:15:00.000Z",
      proposedDate: "2027-01-31T05:00:00.000Z",
      approvedEffectiveDate: "2026-12-01T05:00:00.000Z",
      subject: event.subject,
      description: event.description,
      types: [{ SPA_TYPE_ID: 5, SPA_TYPE_NAME: "Eligibility" }],
      subTypes: [
        { TYPE_ID: 6, TYPE_NAME: "CHIP Eligibility" },
        { TYPE_ID: 7, TYPE_NAME: "MAGI" },
      ],
    };
    const oldPackage = { ...packageDocument, ...sourceValues, id: oldId };
    getPackageChangelogSpy.mockResolvedValueOnce({
      hits: {
        hits: [
          {
            _id: `${oldId}-1234`,
            _source: {
              id: `${oldId}-1234`,
              packageId: oldId,
              event: "new-chip-submission",
              timestamp: 1234,
            },
          },
        ],
      },
    } as never);

    await handleChipSpaPackageDetailsUpdated(
      createContext({
        event: { ...event, id: newId, state: "Maryland" } as SmartOnemacEvent,
        existence: {
          mainById: undefined,
          mainBySpaWaiverId: {
            hits: { hits: [{ _id: oldId, _source: oldPackage }] },
          } as Awaited<ReturnType<typeof os.search>>,
          changelogById: emptySearch,
        },
      }),
    );

    expect(createItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      expect.objectContaining({
        id: newId,
        state: "MD",
        origin: "OneMAC",
        smartPackageDetailsPreviousId: oldId,
        smartPackageDetailsChangedAt: STATUS_CHANGED_AT,
      }),
    );
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-changelog",
      expect.arrayContaining([
        expect.objectContaining({ id: `${newId}-1234`, packageId: newId }),
        expect.objectContaining({
          packageId: newId,
          event: "update-id",
          idToBeUpdated: oldId,
          changeMade: `Package ID changed from ${oldId} to ${newId}; State changed from CA to MD`,
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
  });

  it("rejects a rename when the new ID is occupied by another package", async () => {
    const newId = "MD-26-1105-CHIP";
    await handleChipSpaPackageDetailsUpdated(
      createContext({
        event: { ...event, id: newId, state: "Maryland" } as SmartOnemacEvent,
        existence: {
          mainById: packageById({ spaWaiverId: "another-external-id" }, newId),
          mainBySpaWaiverId: packageSearch({}, PACKAGE_ID),
          changelogById: emptySearch,
        },
      }),
    );

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION" }),
    );
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it("creates a hidden reservation when package details arrive first", async () => {
    await handleChipSpaPackageDetailsUpdated(
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
        authority: "CHIP SPA",
        smartRecordType: SMART_RECORD_TYPE.RESERVATION,
        submissionDate: "2026-11-05T05:00:00.000Z",
        subject: event.subject,
        description: event.description,
        proposedDate: "2027-01-31T05:00:00.000Z",
        approvedEffectiveDate: "2026-12-01T05:00:00.000Z",
        smartPackageDetailsChangedAt: STATUS_CHANGED_AT,
      }),
    );
    const reservation = createItemSpy.mock.calls[0][2] as Record<string, unknown>;
    expect(reservation.types).toEqual([expect.objectContaining({ SPA_TYPE_NAME: "Eligibility" })]);
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it.each([
    ["authority", "Medicaid SPA"],
    ["operationType", "CHIPSPA_PACKAGE_DETAILS_UPDATED"],
    ["initialSubmissionDate", "2026-02-30"],
  ])("rejects an invalid %s contract value", async (field, value) => {
    const invalidEvent = { ...event, [field]: value } as SmartOnemacEvent;
    await handleChipSpaPackageDetailsUpdated(createContext({ event: invalidEvent }));

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION", payload: invalidEvent }),
    );
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: sink.ErrorType.VALIDATION }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it("rethrows changelog failures before changing the package so Kafka can retry", async () => {
    const outage = new Error("OpenSearch changelog unavailable");
    bulkUpdateDataSpy.mockRejectedValueOnce(outage);

    await expect(handleChipSpaPackageDetailsUpdated(createContext())).rejects.toThrow(outage);
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });
});
