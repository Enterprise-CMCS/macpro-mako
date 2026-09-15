import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { opensearch, SMART_RECORD_TYPE } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { handleMspManualRecordCreated } from "./mspManualRecordCreated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import * as publishSmartIngestErrorModule from "./publishSmartIngestError";

const PACKAGE_ID = "MD-26-0903-SG1";
const EXTERNAL_ID = "a0nTESTMD260903001";
const emptySearch = { hits: { hits: [] } };
const event = {
  spaWaiverId: EXTERNAL_ID,
  id: PACKAGE_ID,
  correlationId: "84156035-5aff-4a0c-b9c3-42f90d633f35",
  origin: "SMART",
  authority: "Medicaid SPA",
  status: "Intake Needed",
  createdAt: "2026-09-11T02:59:31.000Z",
  operationType: "MSP_MANUAL_RECORD_CREATED",
  creationContext: "MANUAL",
} satisfies SmartOnemacEvent;

const packageById = (
  overrides: Partial<opensearch.main.Document> = {},
): Awaited<ReturnType<typeof os.getItem>> =>
  ({
    found: true,
    _id: PACKAGE_ID,
    _source: {
      id: PACKAGE_ID,
      authority: "Medicaid SPA",
      origin: "OneMAC",
      seatoolStatus: "Pending",
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

describe("handleMspManualRecordCreated", () => {
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

  it("backfills only missing identity fields on an existing OneMAC package", async () => {
    await handleMspManualRecordCreated(
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

  it("does not overwrite an existing external ID or duplicate a replay", async () => {
    await handleMspManualRecordCreated(
      createContext({
        existence: {
          mainById: packageById({ spaWaiverId: EXTERNAL_ID, correlationId: event.correlationId }),
          mainBySpaWaiverId: {
            hits: {
              hits: [
                {
                  _id: PACKAGE_ID,
                  _source: packageById({
                    spaWaiverId: EXTERNAL_ID,
                    correlationId: event.correlationId,
                  })._source,
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
  });

  it("creates a hidden SMART reservation when no OneMAC package exists", async () => {
    await handleMspManualRecordCreated(createContext());

    expect(createItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      expect.objectContaining({
        id: PACKAGE_ID,
        origin: "SMART",
        smartRecordType: SMART_RECORD_TYPE.RESERVATION,
        spaWaiverId: EXTERNAL_ID,
        creationContext: "MANUAL",
      }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it("rejects a non-manual creation context", async () => {
    await handleMspManualRecordCreated(
      createContext({ event: { ...event, creationContext: "AUTOMATED" } }),
    );
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).toHaveBeenCalled();
  });

  it("rejects an ID associated with a different external identifier", async () => {
    await handleMspManualRecordCreated(
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

  it("rejects an external identifier already associated with another package ID", async () => {
    await handleMspManualRecordCreated(
      createContext({
        existence: {
          mainById: undefined,
          mainBySpaWaiverId: {
            hits: {
              hits: [
                {
                  _id: "MD-26-0903-OTHER",
                  _source: {
                    id: "MD-26-0903-OTHER",
                    authority: "Medicaid SPA",
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

  it("validates a concurrent package-ID claim before backfilling", async () => {
    createItemSpy.mockResolvedValue({ created: false, reason: "version_conflict" });
    getItemSpy.mockResolvedValue(packageById({ spaWaiverId: "another-external-id" }));
    await handleMspManualRecordCreated(createContext());
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).toHaveBeenCalled();
  });
});
