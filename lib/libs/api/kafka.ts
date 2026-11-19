import { Kafka, Message, Producer } from "kafkajs";
import { validateEnvVariable } from "shared-utils";

const SUBMIT_KAFKA_CLIENT_ID = "submit";

const kafka = new Kafka({
  clientId: SUBMIT_KAFKA_CLIENT_ID,
  brokers: process.env.brokerString ? process.env.brokerString.split(",") : [],
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

let producer: Producer | undefined;
export function getProducer() {
  validateEnvVariable("brokerString");
  return kafka.producer();
}

export async function produceMessage(topic: string, key: string, value: string) {
  producer = producer || getProducer();
  await producer.connect();

  const message: Message = {
    key,
    value,
    partition: 0,
    headers: { source: "mako" },
  };
  console.log(
    "About to send the following message to kafka\n" +
      JSON.stringify({ ...message, value: JSON.parse(message.value as string) }, null, 2),
  );

  try {
    const result = await producer.send({
      topic,
      messages: [message],
    });

    if (!result || result.length === 0) {
      throw new Error("Kafka did not return a valid response.");
    }

    console.log("Message sent successfully", result);

    return result;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}
