import { isActiveMainNonDraftPackage } from "libs/api/package/packageStatus";
import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { opensearch, SMART_RECORD_TYPE } from "shared-types";
import { isHiddenSmartReservation } from "shared-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handleChipSpaManualRecordUpdated } from "./chipSpaManualRecordUpdated";
import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import * as publishSmartIngestErrorModule from "./publishSmartIngestError";

const PACKAGE_ID = "CA-26-1001";
const EXTERNAL_ID = "a0nTESTCHIP261001";
const emptySearch = { hits: { hits: [] } };
const event = {
  spaWaiverId: EXTERNAL_ID,
  id: PACKAGE_ID,
  correlationId: "99b696f5-bf26-489d-98dd-93aaccddc827",
  origin: "SMART",
  authority: "CHIP SPA",
  status: "Intake Needed",
  createdAt: "2026-10-01T15:30:00.000Z",
  createdByUserId: "005TESTCHIPUSER",
  createdByName: "CHIP Super User",
  createdByEmail: "chip.super.user@example.com",
  operationType: "CHIPSPA_MANUAL_RECORD_UPDATED",
  creationContext: "MANUAL",
  state: "California",
  initialSubmissionDate: "2026-10-01",
} satisfies SmartOnemacEvent;

const packageById = (
  overrides: Partial<opensearch.main.Document> = {},
): Awaited<ReturnType<typeof os.getItem>> =>
  ({
    found: true,
    _id: PACKAGE_ID,
    _source: {
      id: PACKAGE_ID,
      authority: "CHIP SPA",
      origin: "OneMAC",
      seatoolStatus: "Pending",
      stateStatus: "Under Review",
      statusDate: "2026-09-30T00:00:00.000Z",
      proposedDate: "2027-01-01T00:00:00.000Z",
      deleted: false,
      ...overrides,
    },
  }) as Awaited<ReturnType<typeof os.getItem>>;

const createContext = (
  overrides: Partial<SmartOnemacEventContext> = {},
): SmartOnemacEventContext => ({
  event,
  existence: {
    mainById: undefined,
    mainBySpaWaiverId: emptySearch,
    changelogById: emptySearch,
  },
  topicPartition: "aws.mulesoft.onemac.events-0",
  kafkaKey: PACKAGE_ID,
  kafkaOffset: 42,
  kafkaTimestamp: Date.parse(event.createdAt),
  ...overrides,
});

const createItemSpy = vi.spyOn(os, "createItem");
const getItemSpy = vi.spyOn(os, "getItem");
const updateItemSpy = vi.spyOn(os, "updateItem");
const logErrorSpy = vi.spyOn(sink, "logError").mockImplementation(() => undefined);
const publishSmartIngestErrorSpy = vi
  .spyOn(publishSmartIngestErrorModule, "publishSmartIngestError")
  .mockResolvedValue(undefined);

describe("handleChipSpaManualRecordUpdated", () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    process.env.osDomain = "https://search.example.test";
    process.env.indexNamespace = "test-";
    createItemSpy.mockResolvedValue({ created: true });
    getItemSpy.mockResolvedValue(packageById());
    updateItemSpy.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnvironment };
  });

  it("creates a hidden reservation that blocks CHIP SPA ID reuse", async () => {
    await handleChipSpaManualRecordUpdated(createContext());

    expect(createItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      expect.objectContaining({
        id: PACKAGE_ID,
        origin: "SMART",
        authority: "CHIP SPA",
        smartRecordType: SMART_RECORD_TYPE.RESERVATION,
        spaWaiverId: EXTERNAL_ID,
        operationType: "CHIPSPA_MANUAL_RECORD_UPDATED",
        creationContext: "MANUAL",
      }),
    );
    const reservation = createItemSpy.mock.calls[0][2];
    expect(isHiddenSmartReservation(reservation)).toBe(true);
    expect(
      isActiveMainNonDraftPackage({
        found: true,
        _source: reservation,
      } as unknown as opensearch.main.ItemResult),
    ).toBe(true);
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it("links only missing identity fields on an existing CHIP SPA", async () => {
    await handleChipSpaManualRecordUpdated(
      createContext({
        existence: {
          mainById: packageById(),
          mainBySpaWaiverId: emptySearch,
          changelogById: emptySearch,
        },
      }),
    );

    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      PACKAGE_ID,
      { spaWaiverId: EXTERNAL_ID, correlationId: event.correlationId },
    );
  });

  it("treats a matching replay as an idempotent no-op", async () => {
    const existingPackage = packageById({
      spaWaiverId: EXTERNAL_ID,
      correlationId: event.correlationId,
    });
    await handleChipSpaManualRecordUpdated(
      createContext({
        existence: {
          mainById: existingPackage,
          mainBySpaWaiverId: {
            hits: { hits: [{ _id: PACKAGE_ID, _source: existingPackage._source }] },
          },
          changelogById: emptySearch,
        },
      }),
    );

    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it.each([
    ["authority", "Medicaid SPA"],
    ["creationContext", "AUTOMATED"],
  ])("rejects an invalid %s contract value", async (field, value) => {
    await handleChipSpaManualRecordUpdated(
      createContext({ event: { ...event, [field]: value } as SmartOnemacEvent }),
    );

    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION", kafkaKey: PACKAGE_ID }),
    );
  });

  it("rejects an ID associated with another SMART external identifier", async () => {
    await handleChipSpaManualRecordUpdated(
      createContext({
        existence: {
          mainById: packageById({ spaWaiverId: "another-external-id" }),
          mainBySpaWaiverId: emptySearch,
          changelogById: emptySearch,
        },
      }),
    );

    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(logErrorSpy).toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION", kafkaKey: PACKAGE_ID }),
    );
  });

  it("rejects an existing package with a different authority", async () => {
    await handleChipSpaManualRecordUpdated(
      createContext({
        existence: {
          mainById: packageById({ authority: "Medicaid SPA" }),
          mainBySpaWaiverId: emptySearch,
          changelogById: emptySearch,
        },
      }),
    );

    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION", kafkaKey: PACKAGE_ID }),
    );
  });

  it("rejects a SMART external identifier associated with another package ID", async () => {
    await handleChipSpaManualRecordUpdated(
      createContext({
        existence: {
          mainById: undefined,
          mainBySpaWaiverId: {
            hits: {
              hits: [
                {
                  _id: "CA-26-1002",
                  _source: {
                    id: "CA-26-1002",
                    authority: "CHIP SPA",
                    origin: "OneMAC",
                    spaWaiverId: EXTERNAL_ID,
                    deleted: false,
                  },
                },
              ],
            },
          },
          changelogById: emptySearch,
        },
      }),
    );

    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).toHaveBeenCalled();
  });
});
