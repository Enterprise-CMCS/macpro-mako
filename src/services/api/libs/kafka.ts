import { Kafka, Message } from "kafkajs";

const kafka = new Kafka({
  clientId: "submit",
  brokers: process.env.brokerString.split(","),
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

export const producer = kafka.producer();

export async function produceMessage(
  topic: string,
  key: string,
  value: string
) {
  await producer.connect();

  const message: Message = {
    key: key,
    value: value,
    partition: 0,
    headers: { source: "micro" },
  };
  console.log(message);

  try {
    await producer.send({
      topic,
      messages: [message],
    });
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    await producer.disconnect();
  }
}
