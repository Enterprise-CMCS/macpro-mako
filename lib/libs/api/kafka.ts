import { Kafka, Message, Producer } from "kafkajs";
import { validateEnvVariable } from "shared-utils";

const kafka = new Kafka({
  clientId: "submit",
  brokers: process.env.brokerString ? process.env.brokerString.split(",") : [],
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

let producer: Producer;
export function getProducer() {
  validateEnvVariable("brokerString");
  return kafka.producer();
}

export async function produceMessage(topic: string, key: string, value: string) {
  producer = producer || getProducer();
  await producer.connect();

  const message: Message = {
    key: key,
    value: value,
    partition: 0,
    headers: { source: "mako" },
  };
  console.log(
    "About to send the following message to kafka\n" +
      JSON.stringify({ ...message, value: JSON.parse(message.value as string) }, null, 2),
  );
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
