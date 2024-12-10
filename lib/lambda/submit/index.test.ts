import { describe, it, expect, vi, beforeEach } from "vitest";
import { submit } from "./index"; // Import your submit function
import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka"; // Mock this function
import { submissionPayloads } from "./submissionPayloads";

// Mock produceMessage
vi.mock("libs/api/kafka", () => ({
  produceMessage: vi.fn(),
}));

// Mock submissionPayloads
vi.mock("./submissionPayloads", () => ({
  submissionPayloads: {
    validEvent: vi.fn().mockResolvedValue({ some: "payload" }),
  },
}));

describe("submit function", () => {
  const mockProduceMessage = vi.mocked(produceMessage);
  const mockSubmissionPayloads = vi.mocked(submissionPayloads);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if the body is missing", async () => {
    const mockEvent = { body: null } as unknown as APIGatewayEvent;

    const result = await submit(mockEvent);

    expect(result.statusCode).toBe(400);
    expect(result.body).toBe('"Event body required"');
  });

  it("should return 400 if event is missing in body", async () => {
    const mockEvent = {
      body: JSON.stringify({}),
    } as APIGatewayEvent;

    const result = await submit(mockEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: "Bad Request - Missing event name in body",
    });
  });

  it("should return 400 if event type is unknown", async () => {
    const mockEvent = {
      body: JSON.stringify({ event: "unknownEvent" }),
    } as APIGatewayEvent;

    const result = await submit(mockEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: "Bad Request - Unknown event type unknownEvent",
    });
  });

  it("should return 200 and call produceMessage for a valid event", async () => {
    const mockEvent = {
      body: JSON.stringify({ event: "validEvent", id: "123" }),
    } as APIGatewayEvent;

    const result = await submit(mockEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ message: "success" });
    expect(mockProduceMessage).toHaveBeenCalledWith(
      process.env.topicName,
      "123",
      JSON.stringify({ some: "payload" })
    );
  });

  it("should return 500 if submissionPayloads throws an error", async () => {
    const mockEvent = {
      body: JSON.stringify({ event: "validEvent", id: "123" }),
    } as APIGatewayEvent;

    mockSubmissionPayloads.validEvent.mockRejectedValue(
      new Error("Payload error")
    );

    const result = await submit(mockEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: "Internal server error",
    });
  });
});
