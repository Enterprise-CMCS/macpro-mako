import { mockedProducer } from "mocks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getProducer, produceMessage } from "./kafka";

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

    mockedProducer.send.mockResolvedValueOnce([{ partition: 0, offset: "1" }]);

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
  });

  it("should throw an error if Kafka send fails", async () => {
    const topic = "test-topic";
    const key = "test-key";
    const value = JSON.stringify({ foo: "bar" });

    const error = new Error("Failed to send message");
    mockedProducer.send.mockRejectedValueOnce(error);

    await expect(produceMessage(topic, key, value)).rejects.toThrow("Failed to send message");

    expect(mockedProducer.connect).toHaveBeenCalled();
    expect(mockedProducer.send).toHaveBeenCalled();
  });

  it("should throw an error if Kafka response is empty", async () => {
    const topic = "test-topic";
    const key = "test-key";
    const value = JSON.stringify({ foo: "bar" });

    mockedProducer.send.mockResolvedValueOnce([]);

    await expect(produceMessage(topic, key, value)).rejects.toThrow(
      "Kafka did not return a valid response.",
    );

    expect(mockedProducer.connect).toHaveBeenCalled();
    expect(mockedProducer.send).toHaveBeenCalled();
  });

  it("should throw an error if Kafka send fails and error not an instance of an error", async () => {
    const topic = "test-topic";
    const key = "test-key";
    const value = JSON.stringify({ foo: "bar" });

    const error = { message: "Failed to send message" };
    mockedProducer.send.mockRejectedValueOnce(error);

    await expect(produceMessage(topic, key, value)).rejects.toThrow(
      "Failed to send message to Kafka",
    );
  });

  it("should throw an error if brokerString is not defined", () => {
    delete process.env.brokerString;
    expect(() => getProducer()).toThrowError();
  });
});
