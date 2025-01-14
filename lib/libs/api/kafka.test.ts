import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { produceMessage, getProducer } from "./kafka";
import { mockedProducer } from "mocks";

describe("Kafka producer functions", () => {
  let brokerString: string | undefined;

  beforeEach(() => {
    brokerString = process.env.brokerString;
    process.env.brokerString = "broker1,broker2";
  });

  afterEach(() => {
    process.env.brokerString = brokerString;
  });

  it("should create a Kafka producer", () => {
    const producer = getProducer();
    expect(producer).toEqual(mockedProducer);
  });

  it("should produce a message successfully", async () => {
    const topic = "test-topic";
    const key = "test-key";
    const value = JSON.stringify({ foo: "bar" });

    await produceMessage(topic, key, value);

    expect(mockedProducer.connect).toHaveBeenCalled();
    expect(mockedProducer.send).toHaveBeenCalledWith({
      topic,
      messages: [
        {
          key,
          value,
          partition: 0,
          headers: { source: "mako" },
        },
      ],
    });
    expect(mockedProducer.disconnect).toHaveBeenCalled();
  });

  it("should handle errors when producing a message", async () => {
    const topic = "test-topic";
    const key = "test-key";
    const value = JSON.stringify({ foo: "bar" });

    const error = new Error("Failed to send message");
    mockedProducer.send.mockRejectedValueOnce(error);

    await produceMessage(topic, key, value);

    expect(mockedProducer.connect).toHaveBeenCalled();
    expect(mockedProducer.send).toHaveBeenCalledWith({
      topic,
      messages: [
        {
          key,
          value,
          partition: 0,
          headers: { source: "mako" },
        },
      ],
    });
    expect(mockedProducer.disconnect).toHaveBeenCalled();
  });

  it("should throw an error if brokerString is not defined", () => {
    delete process.env.brokerString;
    expect(() => getProducer()).toThrowError();
  });
});
