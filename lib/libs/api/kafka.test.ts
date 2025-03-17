import { mockedProducer } from "mocks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getProducer, produceMessage } from "./kafka";

describe("Kafka producer functions", () => {
  let brokerString: string | undefined;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    brokerString = process.env.brokerString;
    process.env.brokerString = "broker1,broker2";

    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
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

  it("should throw an error if Kafka send fails", async () => {
    const topic = "test-topic";
    const key = "test-key";
    const value = JSON.stringify({ foo: "bar" });

    const error = new Error("Failed to send message");
    mockedProducer.send.mockRejectedValueOnce(error);

    await expect(produceMessage(topic, key, value)).rejects.toThrow(
      "Failed to send message to Kafka",
    );

    expect(mockedProducer.connect).toHaveBeenCalled();
    expect(mockedProducer.send).toHaveBeenCalled();
    expect(mockedProducer.disconnect).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error sending message:", error);
  });

  it("should throw an error if Kafka response is empty", async () => {
    const topic = "test-topic";
    const key = "test-key";
    const value = JSON.stringify({ foo: "bar" });

    mockedProducer.send.mockResolvedValueOnce([]); // Simulate invalid Kafka response

    await expect(produceMessage(topic, key, value)).rejects.toThrow(
      "Kafka did not return a valid response.",
    );

    expect(mockedProducer.connect).toHaveBeenCalled();
    expect(mockedProducer.send).toHaveBeenCalled();
    expect(mockedProducer.disconnect).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error sending message:", expect.any(Error));
  });

  it("should throw an error if brokerString is not defined", () => {
    delete process.env.brokerString;
    expect(() => getProducer()).toThrowError();
  });
});
