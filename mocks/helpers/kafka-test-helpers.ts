import { vi } from "vitest";
import { KafkaEvent, KafkaRecord } from "shared-types";

export const mockedProducer = {
  connect: vi.fn(),
  send: vi.fn(),
  disconnect: vi.fn(),
};

export const mockedAdmin = {
  connect: vi.fn(),
  describeGroups: vi.fn().mockResolvedValue({
    groups: [{ state: "Stable" }],
  }),
  fetchTopicOffsets: vi.fn().mockResolvedValue([{ offset: "100" }]),
  fetchOffsets: vi.fn().mockResolvedValue([{ partitions: [{ offset: "100" }] }]),
  disconnect: vi.fn(),
};

export const mockedKafka = vi.fn(() => ({
  producer: vi.fn(() => mockedProducer),
  admin: vi.fn(() => mockedAdmin),
}));

export const convertObjToBase64 = (obj: object) =>
  Buffer.from(JSON.stringify(obj)).toString("base64");

export const createKafkaEvent = (records: KafkaEvent["records"]) => ({
  eventSource: "SelfManagedKafka",
  bootstrapServers: "kafka",
  records,
});

export const createKafkaRecord = ({
  topic,
  key,
  value,
  offset = 0,
}: {
  topic: string;
  key: string;
  value: string;
  offset?: number;
}): KafkaRecord => ({
  key,
  value,
  offset,
  topic,
  partition: 0,
  timestamp: Date.now(),
  timestampType: "CREATE_TIME",
  headers: {},
});
