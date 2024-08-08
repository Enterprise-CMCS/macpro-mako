import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./checkConsumerLag";
import { Kafka } from "kafkajs";

const mockKafkaAdmin = {
  connect: vi.fn(),
  describeGroups: vi.fn().mockResolvedValue({
    groups: [{ state: "Stable" }],
  }),
  fetchTopicOffsets: vi.fn().mockResolvedValue([{ offset: "100" }]),
  fetchOffsets: vi
    .fn()
    .mockResolvedValue([{ partitions: [{ offset: "100" }] }]),
  disconnect: vi.fn(),
};

vi.mock("kafkajs", () => ({
  Kafka: vi.fn().mockImplementation(() => ({
    admin: vi.fn().mockReturnValue(mockKafkaAdmin),
  })),
}));

const mockLambdaClient = {
  send: vi.fn(),
};

vi.mock("@aws-sdk/client-lambda", () => ({
  LambdaClient: vi.fn().mockImplementation(() => mockLambdaClient),
  ListEventSourceMappingsCommand: vi.fn(),
}));

describe("Lambda Handler", () => {
  const callback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle successful execution with stable and current offsets", async () => {
    const event = {
      triggers: [
        {
          function: "test-function",
          topics: ["test-topic"],
        },
      ],
      brokerString: "broker1,broker2",
    };

    mockLambdaClient.send.mockResolvedValueOnce({
      EventSourceMappings: [
        {
          Topics: ["test-topic"],
          SelfManagedKafkaEventSourceConfig: { ConsumerGroupId: "test-group" },
        },
      ],
    });

    await handler(event, null, callback);

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 200,
      stable: true,
      current: true,
      ready: true,
    });
  });

  it("should handle missing event source mappings", async () => {
    const event = {
      triggers: [
        {
          function: "test-function",
          topics: ["nonexistent-topic"],
        },
      ],
      brokerString: "broker1,broker2",
    };

    mockLambdaClient.send.mockResolvedValueOnce({
      EventSourceMappings: [],
    });

    await handler(event, null, callback);

    expect(callback).toHaveBeenCalledWith(
      new Error(
        "ERROR: No event source mapping found for function test-function and topic nonexistent-topic",
      ),
      {
        statusCode: 500,
        stable: false,
        current: false,
        ready: false,
      },
    );
  });

  it("should handle multiple event source mappings", async () => {
    const event = {
      triggers: [
        {
          function: "test-function",
          topics: ["test-topic"],
        },
      ],
      brokerString: "broker1,broker2",
    };

    mockLambdaClient.send.mockResolvedValueOnce({
      EventSourceMappings: [
        {
          Topics: ["test-topic"],
          SelfManagedKafkaEventSourceConfig: { ConsumerGroupId: "test-group" },
        },
        {
          Topics: ["test-topic"],
          SelfManagedKafkaEventSourceConfig: {
            ConsumerGroupId: "test-group-2",
          },
        },
      ],
    });

    await handler(event, null, callback);

    expect(callback).toHaveBeenCalledWith(
      new Error(
        "ERROR: Multiple event source mappings found for function test-function and topic test-topic",
      ),
      {
        statusCode: 500,
        stable: false,
        current: false,
        ready: false,
      },
    );
  });

  it("should handle kafka admin errors", async () => {
    const event = {
      triggers: [
        {
          function: "test-function",
          topics: ["test-topic"],
        },
      ],
      brokerString: "broker1,broker2",
    };

    const kafka = new Kafka({
      clientId: "consumerGroupResetter",
      brokers: event.brokerString?.split(",") || [],
      ssl: true,
    });

    kafka.admin = vi.fn().mockReturnValueOnce({
      connect: vi.fn(),
      describeGroups: vi.fn().mockRejectedValue(new Error("Kafka admin error")),
      fetchTopicOffsets: vi.fn(),
      fetchOffsets: vi.fn(),
      disconnect: vi.fn(),
    });

    await handler(event, null, callback);

    expect(callback).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        statusCode: 500,
      }),
    );
  });

  it("should handle missing ConsumerGroupId", async () => {
    const event = {
      triggers: [
        {
          function: "test-function",
          topics: ["test-topic"],
        },
      ],
      brokerString: "broker1,broker2",
    };

    mockLambdaClient.send.mockResolvedValueOnce({
      EventSourceMappings: [
        {
          Topics: ["test-topic"],
          SelfManagedKafkaEventSourceConfig: null,
        },
      ],
    });

    await handler(event, null, callback);

    expect(callback).toHaveBeenCalledWith(
      new Error(
        "ERROR: No ConsumerGroupId found for function test-function and topic test-topic",
      ),
      {
        statusCode: 500,
        stable: false,
        current: false,
        ready: false,
      },
    );
  });
});
