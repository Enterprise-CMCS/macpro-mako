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
    ready: false,
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
    const info = await admin.describeGroups(triggerInfo.map((a) => a.groupId));
    const statuses = info.groups.map((a) => a.state.toString());
    console.log(statuses);
    await admin.disconnect();
    response.ready = !statuses.includes("Stable") ? true : false;
    console.log(response);
  } catch (error: any) {
    response.statusCode = 500;
    callback(error, response);
  } finally {
    callback(null, response);
  }
};