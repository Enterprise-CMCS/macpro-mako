import { beforeEach, describe, expect, it, vi } from "vitest";

const handlers = vi.hoisted(() => ({
  evaluateExistence: vi.fn(),
  manualRecordCreated: vi.fn(),
  statusUpdated: vi.fn(),
  administrativeFieldUpdated: vi.fn(),
  splitSpaCreated: vi.fn(),
  assignmentUpdated: vi.fn(),
  raiWithdrawalToggled: vi.fn(),
  defaultEvent: vi.fn(),
}));

vi.mock("./evaluateSmartPackageExistence", () => ({
  evaluateSmartPackageExistence: handlers.evaluateExistence,
}));
vi.mock("./mspManualRecordCreated", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./mspManualRecordCreated")>()),
  handleMspManualRecordCreated: handlers.manualRecordCreated,
}));
vi.mock("./mspStatusUpdated", () => ({
  handleMspStatusUpdated: handlers.statusUpdated,
}));
vi.mock("./mspAdministrativeFieldUpdated", () => ({
  handleMspAdministrativeFieldUpdated: handlers.administrativeFieldUpdated,
}));
vi.mock("./mspSplitSpaCreated", () => ({
  handleMspSplitSpaCreated: handlers.splitSpaCreated,
}));
vi.mock("./mspAssignmentUpdated", () => ({
  handleMspAssignmentUpdated: handlers.assignmentUpdated,
}));
vi.mock("./mspRaiWithdrawalToggled", () => ({
  handleMspRaiWithdrawalToggled: handlers.raiWithdrawalToggled,
}));
vi.mock("./defaultSmartOnemacEvent", () => ({
  handleDefaultSmartOnemacEvent: handlers.defaultEvent,
}));

import { dispatchSmartOnemacEvent } from "./dispatchSmartOnemacEvent";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";

const TOPIC_PARTITION = "aws.mulesoft.onemac.events-0";
const metadata = Object.freeze({
  topicPartition: TOPIC_PARTITION,
  kafkaKey: "AL-26-0817-0001",
  kafkaOffset: 42,
  kafkaTimestamp: 1786995273000,
});
const baseEvent = Object.freeze({
  spaWaiverId: "a0ncp000006Wdh7AAC",
  id: "AL-26-0817-0001",
  correlationId: "fb6c75a4-c545-4f81-bb7b-a2e8609c978f",
  origin: "SMART",
  authority: "Medicaid SPA",
  status: "Intake Needed",
  createdAt: "2026-08-17T16:54:33.000Z",
} satisfies SmartOnemacEvent);
const existence = Object.freeze({
  mainById: undefined,
  mainBySpaWaiverId: { hits: { hits: [] } },
  changelogById: { hits: { hits: [] } },
});

const knownOperations = [
  ["MSP_MANUAL_RECORD_CREATED", handlers.manualRecordCreated],
  ["MSP_STATUS_UPDATED", handlers.statusUpdated],
  ["MSP_ADMINISTRATIVE_FIELD_UPDATED", handlers.administrativeFieldUpdated],
  ["MSP_SPLIT_SPA_CREATED", handlers.splitSpaCreated],
  ["MSP_ASSIGNMENT_UPDATED", handlers.assignmentUpdated],
  ["MSP_RAI_WITHDRAWAL_TOGGLED", handlers.raiWithdrawalToggled],
] as const;

describe("dispatchSmartOnemacEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handlers.evaluateExistence.mockResolvedValue(existence);
    for (const handler of Object.values(handlers)) {
      if (handler !== handlers.evaluateExistence) {
        handler.mockResolvedValue(undefined);
      }
    }
  });

  it("evaluates existence exactly once before invoking a handler", async () => {
    const event = { ...baseEvent, operationType: "MSP_MANUAL_RECORD_CREATED" };

    await dispatchSmartOnemacEvent(event, metadata);

    expect(handlers.evaluateExistence).toHaveBeenCalledOnce();
    expect(handlers.evaluateExistence).toHaveBeenCalledWith(event);
    expect(handlers.evaluateExistence.mock.invocationCallOrder[0]).toBeLessThan(
      handlers.manualRecordCreated.mock.invocationCallOrder[0],
    );
  });

  it.each(knownOperations)("routes %s to its dedicated handler", async (operationType, handler) => {
    const event = { ...baseEvent, operationType };

    await dispatchSmartOnemacEvent(event, metadata);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ event, existence, ...metadata });
    for (const [, otherHandler] of knownOperations) {
      if (otherHandler !== handler) {
        expect(otherHandler).not.toHaveBeenCalled();
      }
    }
    expect(handlers.defaultEvent).not.toHaveBeenCalled();
  });

  it.each([undefined, "MSP_NOT_A_REAL_TYPE"])(
    "routes operationType %s to the default handler",
    async (operationType) => {
      const event = { ...baseEvent, operationType };

      await dispatchSmartOnemacEvent(event, metadata);

      expect(handlers.defaultEvent).toHaveBeenCalledOnce();
      expect(handlers.defaultEvent).toHaveBeenCalledWith({
        event,
        existence,
        ...metadata,
      });
      for (const [, handler] of knownOperations) {
        expect(handler).not.toHaveBeenCalled();
      }
    },
  );
});
