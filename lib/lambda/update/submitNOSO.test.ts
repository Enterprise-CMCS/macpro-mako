import { NOT_EXISTING_ITEM_ID, TEST_ITEM_ID } from "mocks";
import { APIGatewayEvent } from "node_modules/shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./submitNOSO";

vi.mock("libs/handler-lib", () => ({
  response: vi.fn((data) => data),
}));

vi.mock("libs/api/kafka", () => ({
  produceMessage: vi.fn(() => Promise.resolve([{ partition: 0, offset: "1" }])),
}));

describe("handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.topicName = "test-topic";
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;
    const result = await handler(event);
    const expectedResult = { statusCode: 400, body: { message: "Event body required" } };

    expect(result).toStrictEqual(expectedResult);
  });

  it("should return 400 if package ID is not found", async () => {
    const noActionevent = {
      body: JSON.stringify({ packageId: "123", changeReason: "Nunya", authority: "test" }),
    } as APIGatewayEvent;

    const resultPackage = await handler(noActionevent);

    expect(resultPackage?.statusCode).toBe(400);
  });
  it("should return 400 if admingChangeType is not found", async () => {
    const noApackageEvent = {
      body: JSON.stringify({ action: "123", changeReason: "Nunya" }),
    } as APIGatewayEvent;

    const resultAction = await handler(noApackageEvent);

    expect(resultAction?.statusCode).toBe(400);
  });
  it("should return 400 if existing item is entered", async () => {
    const noActionevent = {
      body: JSON.stringify({
        id: TEST_ITEM_ID,
        adminChangeType: "NOSO",
        authority: "SPA",
        submitterEmail: "test@email.com",
        submitterName: "Name",
        status: "submitted",
        changeMade: "change",
        mockEvent: "mock-event",
        changeReason: "reason",
        submissionDate: "1/1/2025",
        proposedDate: "12/1/2025",
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);

    const expectedResult = {
      statusCode: 400,
      body: { message: `Package with id: ${TEST_ITEM_ID} already exists.` },
    };
    expect(result).toStrictEqual(expectedResult);
  });

  it("should submit a new item", async () => {
    const validItem = {
      body: JSON.stringify({
        id: NOT_EXISTING_ITEM_ID,
        authority: "Medicaid SPA",
        status: "submitted",
        submitterEmail: "test@email.com",
        submitterName: "Name",
        adminChangeType: "NOSO",
        changeMade: "change",
        mockEvent: "mock-event",
        changeReason: "reason",
        submissionDate: "1/1/2025",
        proposedDate: "12/1/2025",
      }),
    } as APIGatewayEvent;

    const result = await handler(validItem);

    const expectedResult = {
      statusCode: 200,
      body: { message: `${NOT_EXISTING_ITEM_ID} has been submitted.` },
    };
    expect(result).toStrictEqual(expectedResult);
  });

  it("should fail to create a package ID with no topic name", async () => {
    process.env.topicName = "";
    const validItem = {
      body: JSON.stringify({
        id: NOT_EXISTING_ITEM_ID,
        authority: "Medicaid SPA",
        status: "submitted",
        submitterEmail: "test@email.com",
        submitterName: "Name",
        adminChangeType: "NOSO",
        mockEvent: "mock-event",
        changeMade: "change",
        changeReason: "reason",
        submissionDate: "1/1/2025",
        proposedDate: "12/1/2025",
      }),
    } as APIGatewayEvent;

    const result = await handler(validItem);
    const expectedResult = {
      statusCode: 500,
      body: { message: "Topic name is not defined" },
    };
    expect(result).toStrictEqual(expectedResult);
  });
});
