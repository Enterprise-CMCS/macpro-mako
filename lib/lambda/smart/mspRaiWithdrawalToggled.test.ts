import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { opensearch, SEATOOL_STATUS, SMART_RECORD_TYPE } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { handleMspRaiWithdrawalToggled } from "./mspRaiWithdrawalToggled";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import * as publishSmartIngestErrorModule from "./publishSmartIngestError";

const TOPIC_PARTITION = "aws.mulesoft.onemac.events-0";
const PACKAGE_ID = "AL-26-0001-GATT";
const EXTERNAL_ID = "a0ncp000006RG8TAAW";
const RAI_ID = "a0qcp000005GbK5AAK";
const TOGGLE_DATE = "2026-08-17T16:11:46.000Z";
const TOGGLE_TIMESTAMP = Date.parse(TOGGLE_DATE);

const event = Object.freeze({
  spaWaiverId: EXTERNAL_ID,
  id: PACKAGE_ID,
  correlationId: "",
  origin: "SMART",
  authority: "Medicaid SPA",
  status: "Pending Second Clock",
  createdAt: TOGGLE_DATE,
  createdByUserId: "005cp00000Jqq9HAAR",
  createdByName: "Alice Jones",
  createdByEmail: "alice.j@globalalliantinc.com",
  operationType: "MSP_RAI_WITHDRAWAL_TOGGLED",
  raiId: RAI_ID,
  raiName: `${PACKAGE_ID}-RAI`,
  raiWithdrawnToggle: true,
  raiWithdrawnToggleDate: TOGGLE_DATE,
} satisfies SmartOnemacEvent);

const packageDocument = {
  id: PACKAGE_ID,
  origin: "OneMAC",
  authority: "Medicaid SPA",
  state: "AL",
  seatoolStatus: SEATOOL_STATUS.PENDING,
  cmsStatus: "Pending",
  stateStatus: "Under Review",
  raiRequestedDate: "2026-07-01T12:00:00.000Z",
  raiReceivedDate: "2026-08-01T12:00:00.000Z",
  raiWithdrawEnabled: false,
  spaWaiverId: EXTERNAL_ID,
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

const emptySearch = { hits: { hits: [] } };
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
  topicPartition: TOPIC_PARTITION,
  kafkaKey: PACKAGE_ID,
  kafkaOffset: 42,
  kafkaTimestamp: TOGGLE_TIMESTAMP,
  ...overrides,
});

const updateItemSpy = vi.spyOn(os, "updateItem");
const createItemSpy = vi.spyOn(os, "createItem");
const bulkUpdateDataSpy = vi.spyOn(os, "bulkUpdateData");
const logErrorSpy = vi.spyOn(sink, "logError").mockImplementation(() => undefined);
const publishSmartIngestErrorSpy = vi
  .spyOn(publishSmartIngestErrorModule, "publishSmartIngestError")
  .mockResolvedValue(undefined);

describe("handleMspRaiWithdrawalToggled", () => {
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

  it("enables withdrawal on the existing package without replacing status or origin", async () => {
    await handleMspRaiWithdrawalToggled(createContext());

    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      PACKAGE_ID,
      expect.objectContaining({
        raiWithdrawEnabled: true,
        raiId: RAI_ID,
        raiName: event.raiName,
        raiWithdrawnToggleDate: TOGGLE_DATE,
        makoChangedDate: TOGGLE_DATE,
      }),
    );
    const mainUpdates = updateItemSpy.mock.calls[0][3];
    expect(mainUpdates).not.toHaveProperty("origin");
    expect(mainUpdates).not.toHaveProperty("seatoolStatus");
    expect(mainUpdates).not.toHaveProperty("cmsStatus");
    expect(mainUpdates).not.toHaveProperty("stateStatus");
    expect(mainUpdates).not.toHaveProperty("operationType");
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("writes the existing admin-change shape with the SMART event timestamp", async () => {
    await handleMspRaiWithdrawalToggled(createContext());

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-changelog",
      [
        expect.objectContaining({
          id: `${PACKAGE_ID}-smart-rai-toggle-${RAI_ID}-${TOGGLE_TIMESTAMP}-enabled`,
          packageId: PACKAGE_ID,
          event: "toggle-withdraw-rai",
          timestamp: TOGGLE_TIMESTAMP,
          isAdminChange: true,
          raiWithdrawEnabled: true,
          raiId: RAI_ID,
          submitterName: event.createdByName,
          changeMade: "Enabled State package action to withdraw formal RAI response",
        }),
      ],
      { throwOnBulkError: true },
    );
  });

  it("disables withdrawal and records a disable admin change", async () => {
    const disabledEvent = { ...event, raiWithdrawnToggle: false };

    await handleMspRaiWithdrawalToggled(
      createContext({
        event: disabledEvent,
        existence: {
          mainById: packageById({ raiWithdrawEnabled: true }),
          mainBySpaWaiverId: packageSearch({ raiWithdrawEnabled: true }),
          changelogById: emptySearch,
        },
      }),
    );

    expect(updateItemSpy.mock.calls[0][3]).toEqual(
      expect.objectContaining({ raiWithdrawEnabled: false }),
    );
    expect(bulkUpdateDataSpy.mock.calls[0][2][0]).toEqual(
      expect.objectContaining({
        raiWithdrawEnabled: false,
        changeMade: "Disabled State package action to withdraw formal RAI response",
      }),
    );
  });

  it("falls back to an untouched package ID and backfills spaWaiverId", async () => {
    await handleMspRaiWithdrawalToggled(
      createContext({
        existence: {
          mainById: packageById({ spaWaiverId: undefined }),
          mainBySpaWaiverId: emptySearch,
          changelogById: emptySearch,
        },
      }),
    );

    expect(updateItemSpy.mock.calls[0][3]).toEqual(
      expect.objectContaining({
        spaWaiverId: EXTERNAL_ID,
        raiWithdrawEnabled: true,
      }),
    );
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("falls back to createdAt when raiWithdrawnToggleDate is absent", async () => {
    const eventWithoutToggleDate = { ...event, raiWithdrawnToggleDate: undefined };

    await handleMspRaiWithdrawalToggled(createContext({ event: eventWithoutToggleDate }));

    expect(updateItemSpy.mock.calls[0][3]).toEqual(
      expect.objectContaining({ raiWithdrawnToggleDate: event.createdAt }),
    );
    expect(bulkUpdateDataSpy.mock.calls[0][2][0]).toEqual(
      expect.objectContaining({ timestamp: Date.parse(event.createdAt) }),
    );
  });

  it("publishes validation for an invalid raiWithdrawnToggleDate", async () => {
    const invalidEvent = { ...event, raiWithdrawnToggleDate: "2026-13-40T25:61:61Z" };

    await handleMspRaiWithdrawalToggled(createContext({ event: invalidEvent }));

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION", payload: invalidEvent }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("uses the same admin document ID for an idempotent replay", async () => {
    const context = createContext();

    await handleMspRaiWithdrawalToggled(context);
    await handleMspRaiWithdrawalToggled(context);

    expect(bulkUpdateDataSpy).toHaveBeenCalledTimes(2);
    expect(bulkUpdateDataSpy.mock.calls[0][2][0].id).toBe(bulkUpdateDataSpy.mock.calls[1][2][0].id);
  });

  it("records stale activity without regressing the latest package toggle", async () => {
    const newerDate = "2026-08-18T16:11:46.000Z";

    await handleMspRaiWithdrawalToggled(
      createContext({
        existence: {
          mainById: packageById({
            raiWithdrawEnabled: false,
            raiId: RAI_ID,
            raiWithdrawnToggleDate: newerDate,
          }),
          mainBySpaWaiverId: packageSearch({
            raiWithdrawEnabled: false,
            raiId: RAI_ID,
            raiWithdrawnToggleDate: newerDate,
          }),
          changelogById: emptySearch,
        },
      }),
    );

    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).toHaveBeenCalledOnce();
  });

  it("does not regress a newer toggle from the existing OneMAC changelog", async () => {
    const newerTimestamp = Date.parse("2026-08-18T16:11:46.000Z");
    const currentPackage = { raiWithdrawEnabled: true, raiWithdrawnToggleDate: undefined };
    const staleDisableEvent = { ...event, raiWithdrawnToggle: false };

    await handleMspRaiWithdrawalToggled(
      createContext({
        event: staleDisableEvent,
        existence: {
          mainById: packageById(currentPackage),
          mainBySpaWaiverId: packageSearch(currentPackage),
          changelogById: {
            hits: {
              hits: [
                {
                  _id: `${PACKAGE_ID}-${newerTimestamp}`,
                  _source: {
                    id: `${PACKAGE_ID}-${newerTimestamp}`,
                    packageId: PACKAGE_ID,
                    event: "toggle-withdraw-rai",
                    timestamp: newerTimestamp,
                    raiWithdrawEnabled: true,
                  },
                },
              ],
            },
          },
        },
      }),
    );

    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).toHaveBeenCalledOnce();
  });

  it("rejects a conflicting toggle at the same timestamp", async () => {
    await handleMspRaiWithdrawalToggled(
      createContext({
        existence: {
          mainById: packageById({
            raiWithdrawEnabled: false,
            raiId: RAI_ID,
            raiWithdrawnToggleDate: TOGGLE_DATE,
          }),
          mainBySpaWaiverId: packageSearch({
            raiWithdrawEnabled: false,
            raiId: RAI_ID,
            raiWithdrawnToggleDate: TOGGLE_DATE,
          }),
          changelogById: emptySearch,
        },
      }),
    );

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION", payload: event }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it.each([
    ["a missing package", undefined, emptySearch],
    [
      "a hidden SMART reservation",
      packageById({ origin: "SMART", smartRecordType: SMART_RECORD_TYPE.RESERVATION }),
      packageSearch({ origin: "SMART", smartRecordType: SMART_RECORD_TYPE.RESERVATION }),
    ],
    ["a deleted package", packageById({ deleted: true }), packageSearch({ deleted: true })],
  ])("publishes validation for %s instead of creating a package", async (_, mainById, search) => {
    await handleMspRaiWithdrawalToggled(
      createContext({
        existence: {
          mainById,
          mainBySpaWaiverId: search,
          changelogById: emptySearch,
        },
      }),
    );

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION" }),
    );
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: sink.ErrorType.VALIDATION }),
    );
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("rejects another package that owns spaWaiverId", async () => {
    const conflictingSearch = {
      hits: {
        hits: [
          {
            _id: "AL-26-9999",
            _source: { ...packageDocument, id: "AL-26-9999" },
          },
        ],
      },
    };

    await handleMspRaiWithdrawalToggled(
      createContext({
        existence: {
          mainById: packageById(),
          mainBySpaWaiverId: conflictingSearch,
          changelogById: emptySearch,
        },
      }),
    );

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION" }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it.each(["raiId", "raiName", "raiWithdrawnToggle"])(
    "publishes validation when %s is missing",
    async (field) => {
      const invalidEvent = { ...event } as Record<string, unknown>;
      delete invalidEvent[field];

      await handleMspRaiWithdrawalToggled(
        createContext({ event: invalidEvent as SmartOnemacEvent }),
      );

      expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ errorCode: "VALIDATION", payload: invalidEvent }),
      );
      expect(updateItemSpy).not.toHaveBeenCalled();
      expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
    },
  );

  it("supports CHIP SPA packages", async () => {
    const chipEvent = { ...event, authority: "CHIP SPA" };

    await handleMspRaiWithdrawalToggled(
      createContext({
        event: chipEvent,
        existence: {
          mainById: packageById({ authority: "CHIP SPA" }),
          mainBySpaWaiverId: packageSearch({ authority: "CHIP SPA" }),
          changelogById: emptySearch,
        },
      }),
    );

    expect(updateItemSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringMatching(/main$/),
      PACKAGE_ID,
      expect.objectContaining({ raiWithdrawEnabled: true }),
    );
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("rethrows OpenSearch failures so Kafka can retry", async () => {
    const outage = new Error("OpenSearch unavailable");
    updateItemSpy.mockRejectedValueOnce(outage);

    await expect(handleMspRaiWithdrawalToggled(createContext())).rejects.toThrow(outage);

    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("rethrows changelog failures so a Kafka retry can repair the partial write", async () => {
    const outage = new Error("OpenSearch changelog unavailable");
    bulkUpdateDataSpy.mockRejectedValueOnce(outage);

    await expect(handleMspRaiWithdrawalToggled(createContext())).rejects.toThrow(outage);

    expect(updateItemSpy).toHaveBeenCalledOnce();
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });
});
