import { vi } from "vitest";

export const mockedProducer = {
  connect: vi.fn(),
  send: vi.fn(),
  disconnect: vi.fn(),
};

export const TOPIC_ONE = "topic-1--part1--section1--div3";
export const TOPIC_TWO = "topic-2--part1--section1--div3";
export const TOPIC_THREE = "topic-3--part1--section1--div3";
const topics = [TOPIC_ONE, TOPIC_TWO, TOPIC_THREE];

const topicMetaData = {
  topics: [
    {
      name: TOPIC_ONE,
      partitions: [
        {
          partitionErrorCode: 0, // default: 0
          partitionId: 1,
          leader: 1,
          replicas: [],
          isr: [],
        },
      ],
    },
    {
      name: TOPIC_THREE,
      partitions: [
        {
          partitionErrorCode: 0, // default: 0
          partitionId: 1,
          leader: 1,
          replicas: [],
          isr: [],
        },
      ],
    },
    {
      name: TOPIC_TWO,
      partitions: [
        {
          partitionErrorCode: 0, // default: 0
          partitionId: 1,
          leader: 1,
          replicas: [],
          isr: [],
        },
      ],
    },
  ],
};
const describeConfigs = {
  resources: [
    {
      configEntries: [
        {
          configName: "cleanup.policy",
          configValue: "delete",
          isDefault: true,
          configSource: 5,
          isSensitive: false,
          readOnly: false,
        },
      ],
      errorCode: 0,
      errorMessage: null,
      resourceName: "topic-name",
      resourceType: 2,
    },
  ],
  throttleTime: 0,
};
export const mockedAdmin = {
  connect: vi.fn(),
  describeGroups: vi.fn().mockResolvedValue({
    groups: [{ state: "Stable" }],
  }),
  listTopics: vi.fn().mockReturnValue(topics),
  createTopics: vi.fn(),
  createPartitions: vi.fn(),
  deleteTopics: vi.fn(),
  fetchTopicMetadata: vi.fn().mockReturnValue(topicMetaData),
  fetchTopicOffsets: vi.fn().mockResolvedValue([{ offset: "100" }]),
  describeConfigs: vi.fn().mockResolvedValue(describeConfigs),
  fetchOffsets: vi.fn().mockResolvedValue([{ partitions: [{ offset: "100" }] }]),
  disconnect: vi.fn(),
};

export const mockedKafka = vi.fn(() => ({
  producer: vi.fn(() => mockedProducer),
  admin: vi.fn(() => mockedAdmin),
}));
