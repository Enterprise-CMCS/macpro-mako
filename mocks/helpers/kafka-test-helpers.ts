import { vi } from "vitest";

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
