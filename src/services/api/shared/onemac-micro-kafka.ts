import { Kafka, Message, KafkaConfig, Producer } from "kafkajs";

export type IKafkaService = {
  produceMessage: (topic: string, key: string, value: string) => Promise<void>;
};

export class KafkaService implements IKafkaService {
  private readonly producer: Producer;

  constructor(config: KafkaConfig) {
    const kafka = new Kafka(config);

    this.producer = kafka.producer();
  }

  async produceMessage(topic: string, key: string, value: string) {
    await this.producer.connect();

    const message: Message = {
      key: key,
      value: value,
      partition: 0,
      headers: { source: "micro" },
    };
    console.log(message);

    try {
      await this.producer.send({
        topic,
        messages: [message],
      });
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      await this.producer.disconnect();
    }
  }
}
