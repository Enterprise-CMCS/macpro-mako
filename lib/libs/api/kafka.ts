import { Kafka, Message, Producer } from "kafkajs";
import { validateEnvVariable } from "shared-utils";

const SUBMIT_KAFKA_CLIENT_ID = "submit";
const CENTRA_KAFKA_CLIENT_ID = "submit-centra";

const kafkaConfig = {
  brokers: process.env.brokerString ? process.env.brokerString.split(",") : [],
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
  ssl: {
    rejectUnauthorized: false,
  },
};

const kafka = new Kafka({
  clientId: SUBMIT_KAFKA_CLIENT_ID,
  ...kafkaConfig,
});

const centraKafka = new Kafka({
  clientId: CENTRA_KAFKA_CLIENT_ID,
  ...kafkaConfig,
});

let producer: Producer | undefined;
export function getProducer() {
  validateEnvVariable("brokerString");
  return kafka.producer();
}

let centraProducer: Producer | undefined;
export function getCentraProducer() {
  validateEnvVariable("brokerString");
  return centraKafka.producer();
}

async function sendMessage(activeProducer: Producer, topic: string, key: string, value: string) {
  await activeProducer.connect();

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
    const result = await activeProducer.send({
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

export async function produceMessage(topic: string, key: string, value: string) {
  producer = producer || getProducer();
  return sendMessage(producer, topic, key, value);
}

/** Publishes CEntra events to aws.onemac.centra.events. Does not write the CDC topic. */
export async function produceCentraMessage(topic: string, key: string, value: string) {
  centraProducer = centraProducer || getCentraProducer();
  return sendMessage(centraProducer, topic, key, value);
}
