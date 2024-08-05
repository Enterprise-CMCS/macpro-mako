import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Producer } from "kafkajs";
import { produceMessage, getProducer } from "./kafka";

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

describe("Kafka producer functions", () => {
  let mockProducer: Producer;
  let brokerString: string | undefined;

  beforeEach(() => {
    brokerString = process.env.brokerString;
    process.env.brokerString = "broker1,broker2";

    mockProducer = new Producer();
  });

  afterEach(() => {
    process.env.brokerString = brokerString;
  });

  it("should create a Kafka producer", () => {
    const producer = getProducer();
    expect(producer).toBe(mockProducer);
  });

  it("should produce a message successfully", async () => {
    const topic = "test-topic";
    const key = "test-key";
    const value = JSON.stringify({ foo: "bar" });

    await produceMessage(topic, key, value);

    expect(mockProducer.connect).toHaveBeenCalled();
    expect(mockProducer.send).toHaveBeenCalledWith({
      topic,
      messages: [
        {
          key,
          value,
          partition: 0,
          headers: { source: "micro" },
        },
      ],
    });
    expect(mockProducer.disconnect).toHaveBeenCalled();
  });

  it("should handle errors when producing a message", async () => {
    const topic = "test-topic";
    const key = "test-key";
    const value = JSON.stringify({ foo: "bar" });

    const error = new Error("Failed to send message");
    mockProducer.send.mockRejectedValueOnce(error);

    await produceMessage(topic, key, value);

    expect(mockProducer.connect).toHaveBeenCalled();
    expect(mockProducer.send).toHaveBeenCalledWith({
      topic,
      messages: [
        {
          key,
          value,
          partition: 0,
          headers: { source: "micro" },
        },
      ],
    });
    expect(mockProducer.disconnect).toHaveBeenCalled();
  });

  it("should throw an error if brokerString is not defined", () => {
    delete process.env.brokerString;
    expect(() => getProducer()).toThrowError();
  });
});
