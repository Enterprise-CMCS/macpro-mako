import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { SEATOOL_STATUS } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { info } = vi.hoisted(() => ({
  info: vi.fn(),
}));

vi.mock("pino", () => ({
  default: () => ({
    info,
  }),
}));

import { handleDefaultSmartOnemacEvent } from "./defaultSmartOnemacEvent";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import * as publishSmartIngestErrorModule from "./publishSmartIngestError";

const TOPIC_PARTITION = "aws.mulesoft.onemac.events-0";
const event = Object.freeze({
  spaWaiverId: "a0ncp000006Wdh7AAC",
  id: "al-26-0817-0001",
  correlationId: "fb6c75a4-c545-4f81-bb7b-a2e8609c978f",
  origin: "SMART",
  authority: "Medicaid SPA",
  status: "Intake Needed",
  createdAt: "2026-08-17T16:54:33.000Z",
  createdByName: "Alice Jones",
  createdByEmail: "alice@example.test",
} satisfies SmartOnemacEvent);
const emptySearch = { hits: { hits: [] } };
const emptyExistence = {
  mainById: undefined,
  mainBySpaWaiverId: emptySearch,
  changelogById: emptySearch,
};

const getItemSpy = vi.spyOn(os, "getItem");
const createItemSpy = vi.spyOn(os, "createItem");
const updateItemSpy = vi.spyOn(os, "updateItem");
const logErrorSpy = vi.spyOn(sink, "logError").mockImplementation(() => undefined);
const publishSmartIngestErrorSpy = vi
  .spyOn(publishSmartIngestErrorModule, "publishSmartIngestError")
  .mockResolvedValue(undefined);

describe("handleDefaultSmartOnemacEvent", () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    process.env.osDomain = "https://search.example.test";
    process.env.indexNamespace = "test-";
    createItemSpy.mockResolvedValue({ created: true });
    updateItemSpy.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnvironment };
  });

  it("logs that only the minimal SMART envelope was received", async () => {
    await handleDefaultSmartOnemacEvent({
      event,
      existence: emptyExistence,
      topicPartition: TOPIC_PARTITION,
    });

    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({
        id: event.id,
        topicPartition: TOPIC_PARTITION,
      }),
      expect.stringMatching(/only the minimal SMART envelope was received/i),
    );
  });

  it("creates a OneMAC-shaped document when mainById is absent", async () => {
    await handleDefaultSmartOnemacEvent({
      event,
      existence: emptyExistence,
      topicPartition: TOPIC_PARTITION,
    });

    expect(getItemSpy).not.toHaveBeenCalled();
    expect(createItemSpy).toHaveBeenCalledOnce();
    expect(createItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      expect.objectContaining({
        id: "AL-26-0817-0001",
        origin: "SMART",
        state: "AL",
        seatoolStatus: SEATOOL_STATUS.SUBMITTED,
        spaWaiverId: event.spaWaiverId,
        correlationId: event.correlationId,
      }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it("updates exactly the two SMART identity fields when mainById exists", async () => {
    const mainById = {
      found: true,
      _id: "AL-26-0817-0001",
      _source: {
        id: "AL-26-0817-0001",
        origin: "OneMAC",
        seatoolStatus: "Under Review",
      },
    } as Awaited<ReturnType<typeof os.getItem>>;

    await handleDefaultSmartOnemacEvent({
      event,
      existence: { ...emptyExistence, mainById },
      topicPartition: TOPIC_PARTITION,
    });

    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).toHaveBeenCalledOnce();
    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      "AL-26-0817-0001",
      {
        spaWaiverId: event.spaWaiverId,
        correlationId: event.correlationId,
      },
    );
    expect(Object.keys(updateItemSpy.mock.calls[0][3]).sort()).toEqual([
      "correlationId",
      "spaWaiverId",
    ]);
  });

  it("publishes VALIDATION without writing when the ID has an unknown state prefix", async () => {
    const invalidEvent = { ...event, id: "XX-26-0817-0001" };

    await handleDefaultSmartOnemacEvent({
      event: invalidEvent,
      existence: emptyExistence,
      topicPartition: TOPIC_PARTITION,
    });

    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.VALIDATION,
      }),
    );
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "VALIDATION",
        topicPartition: TOPIC_PARTITION,
        kafkaKey: invalidEvent.id,
        correlationId: invalidEvent.correlationId,
        payload: invalidEvent,
      }),
    );
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
  });
});
