import { Handler } from "aws-lambda";
import { Kafka } from "kafkajs";
import { getConsumerGroupInfo } from "../libs/lambda-trigger-lib";

export const handler: Handler = async (
  event,
  context,
  callback
) => {
  const response = {
    statusCode: 200,
  };
  try {
    const triggerInfo: any[] = [];
    for (const functionName of event.Functions) {
      console.log(`Getting consumer groups for function:  ${functionName}`);
      triggerInfo.push(...(await getConsumerGroupInfo(functionName)));
    }
    const kafka = new Kafka({
      clientId: "consumerGroupResetter",
      brokers: event.BrokerString?.split(",") || [],
      ssl: true,
    });
    const admin = kafka.admin();
    for (const trigger of triggerInfo) {
      for (const topic of trigger.topics) {
        console.log(`Resetting group ${trigger.groupId} for topic ${topic}`);
        await admin.resetOffsets({
          groupId: trigger.groupId,
          topic,
          earliest: true,
        });
      }
    }
    await admin.disconnect();
  } catch (error: any) {
    response.statusCode = 500;
    callback(error, response);
  } finally {
    callback(null, response);
  }
};
