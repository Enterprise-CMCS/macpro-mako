import { describe, it, expect, vi, afterEach } from "vitest";
import { handler } from "./checkConsumerLag";
import { Context } from "aws-lambda";
import {
  TEST_FUNCTION_NAME,
  TEST_TOPIC_NAME,
  TEST_NONEXISTENT_TOPIC_NAME,
  TEST_NONEXISTENT_FUNCTION_NAME,
  TEST_MULTIPLE_TOPICS_FUNCTION_NAME,
  TEST_MULTIPLE_TOPICS_TOPIC_NAME,
  TEST_MISSING_CONSUMER_FUNCTION_NAME,
  TEST_MISSING_CONSUMER_TOPIC_NAME,
} from "mocks";

const mockKafkaAdmin = {
  connect: vi.fn(),
  describeGroups: vi.fn().mockResolvedValue({
    groups: [{ state: "Stable" }],
  }),
  fetchTopicOffsets: vi.fn().mockResolvedValue([{ offset: "100" }]),
  fetchOffsets: vi.fn().mockResolvedValue([{ partitions: [{ offset: "100" }] }]),
  disconnect: vi.fn(),
};

vi.mock("kafkajs", () => ({
  Kafka: vi.fn().mockImplementation(() => ({
    admin: vi.fn().mockReturnValue(mockKafkaAdmin),
  })),
}));

describe("Lambda Handler", () => {
  const callback = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should handle successful execution with stable and current offsets", async () => {
    const event = {
      triggers: [
        {
          function: TEST_FUNCTION_NAME,
          topics: [TEST_TOPIC_NAME],
        },
      ],
      brokerString: "broker1,broker2",
    };

    await handler(event, {} as Context, callback);

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 200,
      stable: true,
      current: true,
      ready: true,
    });
  });

  it.each([
    [
      "should handle missing function",
      TEST_NONEXISTENT_FUNCTION_NAME,
      TEST_TOPIC_NAME,
      `ERROR: No event source mapping found for function ${TEST_NONEXISTENT_FUNCTION_NAME} and topic ${TEST_TOPIC_NAME}`,
    ],
    [
      "should handle missing topic",
      TEST_FUNCTION_NAME,
      TEST_NONEXISTENT_TOPIC_NAME,
      `ERROR: No event source mapping found for function ${TEST_FUNCTION_NAME} and topic ${TEST_NONEXISTENT_TOPIC_NAME}`,
    ],
    [
      "should handle multiple event source mappings",
      TEST_MULTIPLE_TOPICS_FUNCTION_NAME,
      TEST_MULTIPLE_TOPICS_TOPIC_NAME,
      `ERROR: Multiple event source mappings found for function ${TEST_MULTIPLE_TOPICS_FUNCTION_NAME} and topic ${TEST_MULTIPLE_TOPICS_TOPIC_NAME}`,
    ],
    [
      "should handle missing ConsumerGroupId",
      TEST_MISSING_CONSUMER_FUNCTION_NAME,
      TEST_MISSING_CONSUMER_TOPIC_NAME,
      `ERROR: No ConsumerGroupId found for function ${TEST_MISSING_CONSUMER_FUNCTION_NAME} and topic ${TEST_MISSING_CONSUMER_TOPIC_NAME}`,
    ],
  ])("%s", async (_, funcName, topicName, errorMessage) => {
    const event = {
      triggers: [
        {
          function: funcName,
          topics: [topicName],
        },
      ],
      brokerString: "broker1,broker2",
    };

    await handler(event, {} as Context, callback);

    expect(callback).toHaveBeenCalledWith(new Error(errorMessage), {
      statusCode: 500,
      stable: false,
      current: false,
      ready: false,
    });
  });

  it("should handle kafka admin errors", async () => {
    const event = {
      triggers: [
        {
          function: TEST_FUNCTION_NAME,
          topics: [TEST_TOPIC_NAME],
        },
      ],
      brokerString: "broker1,broker2",
    };

    mockKafkaAdmin.describeGroups.mockRejectedValueOnce(new Error("Kafka admin error"));

    await handler(event, {} as Context, callback);

    expect(callback).toHaveBeenCalledWith(new Error(`Kafka admin error`), {
      statusCode: 500,
      stable: false,
      current: false,
      ready: false,
    });
  });
});
