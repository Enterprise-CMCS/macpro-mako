import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { Producer } from "kafkajs";
import { APIGatewayEvent } from "aws-lambda";
import { handler as updatePackage } from "./updatePackage";
import { response } from "libs/handler-lib";
import { getPackage } from "../../libs/api/package";

vi.mock("kafkajs", () => {
  const producer = {
    connect: vi.fn(),
    send: vi.fn(),
    disconnect: vi.fn(),
  };
  const kafka = {
    producer: () => producer,
  };
  return {
    Kafka: vi.fn(() => kafka),
    Producer: vi.fn(() => producer),
  };
});

vi.mock("libs/handler-lib", () => ({
  response: vi.fn(),
}));

vi.mock("../../libs/api/package", () => ({
  getPackage: vi.fn(),
}));

describe("Update package", () => {
  let mockProducer: Producer;
  let brokerString: string | undefined;

  beforeEach(() => {
    brokerString = process.env.brokerString;
    process.env.brokerString = "broker1,broker2";
    process.env.osDomain = "test-domain";
    process.env.topicName = "test-topic";

    mockProducer = new Producer();

    (getPackage as Mock).mockResolvedValue({
      _source: {
        id: "test-id",
        state: "OH",
        initialIntakeNeeded: false,
      },
    });
  });

  it("should send the correct event body", async () => {
    const event = {
      body: JSON.stringify({
        packageId: "test-id",
        action: "delete",
        updatedFields: {
          id: "test-id",
          state: "OH",
          initialIntakeNeeded: false,
        },
      }),
    } as APIGatewayEvent;

    await updatePackage(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 200,
      body: { message: "success" },
    });
  });

  it("should produce a message with package to delete", async () => {
    const event = {
      body: JSON.stringify({
        packageId: "test-id",
        action: "delete",
      }),
    } as APIGatewayEvent;

    await updatePackage(event);

    expect(mockProducer.send).toHaveBeenCalledWith({
      topic: "test-topic",
      messages: [
        {
          key: "test-id",
          value: JSON.stringify({
            deleted: true,
            isAdminChange: true,
            origin: "mako",
          }),
          partition: 0,
          headers: { source: "mako" },
        },
      ],
    });
  });

  it("should produce a message with fields to update", async () => {
    const event = {
      body: JSON.stringify({
        packageId: "test-id",
        action: "update-values",
        updatedFields: {
          state: "MD",
          initialIntakeNeeded: true,
        },
      }),
    } as APIGatewayEvent;

    await updatePackage(event);

    expect(mockProducer.send).toHaveBeenCalledWith({
      topic: "test-topic",
      messages: [
        {
          key: "test-id",
          value: JSON.stringify({
            state: "MD",
            initialIntakeNeeded: true,
            isAdminChange: true,
            origin: "mako",
          }),
          partition: 0,
          headers: { source: "mako" },
        },
      ],
    });
  });

  it("handles updating ID of a package", async () => {});
});
