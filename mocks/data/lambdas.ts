import { TestEventSourceMapping } from "../index.d";

export const TEST_FUNCTION_NAME = "test-function";
export const TEST_TOPIC_NAME = "test-topic";
export const TEST_FUNCTION_TEST_TOPIC_UUID = "38c1c0a1-096c-4cfd-845b-4237d3c888f0";
export const TEST_NONEXISTENT_FUNCTION_NAME = "nonexistent-function";
export const TEST_NONEXISTENT_TOPIC_NAME = "nonexistent-topic";
export const TEST_MULTIPLE_TOPICS_FUNCTION_NAME = "multiple-topic-function";
export const TEST_MULTIPLE_TOPICS_TOPIC_NAME = "multiple-topics-topic";
export const TEST_NO_TRIGGERS_FUNCTION_NAME = "no-triggers-function";
export const TEST_MISSING_CONSUMER_FUNCTION_NAME = "missing-consumer-function";
export const TEST_MISSING_CONSUMER_TOPIC_NAME = "missing-consumer-topic";
export const TEST_DELETE_TRIGGER_FUNCTION_NAME = "delete-function";
export const TEST_DELETE_TRIGGER_TOPIC_NAME = "delete-topic";
export const TEST_DELETE_TRIGGER_UUID = "fc51f7f4-f678-46d5-83c3-d26418be2a5a";
export const TEST_ERROR_EVENT_SOURCE_FUNCTION_NAME = "error-function";
export const TEST_ERROR_EVENT_SOURCE_UUID = "3f01f676-75e9-4f6d-b274-4b817072cfbc";

export const consumerGroups: Record<string, TestEventSourceMapping[]> = {
  [TEST_FUNCTION_NAME]: [
    {
      Topics: [TEST_TOPIC_NAME],
      SelfManagedKafkaEventSourceConfig: { ConsumerGroupId: "test-group" },
      State: "Enabled",
      UUID: TEST_FUNCTION_TEST_TOPIC_UUID,
    },
  ],
  [TEST_MULTIPLE_TOPICS_FUNCTION_NAME]: [
    {
      Topics: [TEST_MULTIPLE_TOPICS_TOPIC_NAME],
      SelfManagedKafkaEventSourceConfig: { ConsumerGroupId: "test-group" },
      State: "Enabled",
      UUID: "772f9cc6-f8f7-46e5-a58c-6b89ce147d0c",
    },
    {
      Topics: [TEST_MULTIPLE_TOPICS_TOPIC_NAME],
      SelfManagedKafkaEventSourceConfig: { ConsumerGroupId: "test-group-2" },
      State: "Enabled",
      UUID: "83aa8994-5520-472e-961c-d9f44abb64d9",
    },
  ],
  [TEST_NO_TRIGGERS_FUNCTION_NAME]: [],
  [TEST_MISSING_CONSUMER_FUNCTION_NAME]: [
    {
      Topics: [TEST_MISSING_CONSUMER_TOPIC_NAME],
      SelfManagedKafkaEventSourceConfig: null,
      State: "Enabled",
      UUID: "2cb32df8-2ff5-41ba-a773-b0f4de8b27b1",
    },
  ],
  [TEST_DELETE_TRIGGER_FUNCTION_NAME]: [
    {
      Topics: [TEST_DELETE_TRIGGER_TOPIC_NAME],
      SelfManagedKafkaEventSourceConfig: { ConsumerGroupId: "test-group-3" },
      State: "Enabled",
      UUID: TEST_DELETE_TRIGGER_UUID,
    },
  ],
};
