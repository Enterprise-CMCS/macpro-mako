import { type KafkaConfig } from "kafkajs";

export const kafkaConfig: KafkaConfig = {
  clientId: "submit",
  brokers: process.env.brokerString ? process.env.brokerString.split(",") : [],
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
  ssl: {
    rejectUnauthorized: false,
  },
};
