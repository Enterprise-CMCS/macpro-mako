import { Handler } from "aws-lambda";
import { KafkaEvent } from "shared-types";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({ region: process.env.region });

export const handler: Handler<KafkaEvent> = async (event) => {
  const queueUrl = process.env.DELAY_QUEUE_URL;
  if (!queueUrl) {
    throw new Error("DELAY_QUEUE_URL is not set");
  }

  for (const [topic, records] of Object.entries(event.records)) {
    for (const record of records) {
      if (record.value) {
        await sqsClient.send(
          new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify({
              topic,
              key: record.key,
              value: record.value,
              timestamp: record.timestamp || Date.now(),
            }),
          }),
        );
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Messages sent to SQS" }),
  };
};
