import { Handler } from "aws-lambda";
import { Kafka } from "kafkajs";
import {
  LambdaClient,
  ListEventSourceMappingsCommand,
  UpdateEventSourceMappingCommand,
} from "@aws-sdk/client-lambda";
import * as os from "./../../../libs/opensearch-lib";
import { getConsumerGroupInfo } from "../libs/lambda-trigger-lib";

export const toggleTriggers: Handler = async () => {
  try {
    if (!process.env.functions) {
      throw "process.env.functions cannot be undefined";
    }
    const enabled = process.env.enabled === "true";
    for (const functionName of process.env.functions.split(",")) {
      const lambdaClient = new LambdaClient({});
      const response = await lambdaClient.send(
        new ListEventSourceMappingsCommand({ FunctionName: functionName })
      );
      for (const eventSourceMapping of response.EventSourceMappings || []) {
        if (eventSourceMapping.SelfManagedKafkaEventSourceConfig) {
          console.log(
            `Disabling all Kafka triggers for function:  ${functionName}`
          );
          await lambdaClient.send(
            new UpdateEventSourceMappingCommand({
              UUID: eventSourceMapping.UUID,
              Enabled: enabled,
            })
          );
        }
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const toggleTriggersTwo: Handler = async (event, context, callback) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const response = {
    statusCode: 200,
  };
  try {
    let enabled = event.Enabled
    for (const functionName of event.Functions) {
      const lambdaClient = new LambdaClient({});
      const response = await lambdaClient.send(
        new ListEventSourceMappingsCommand({ FunctionName: functionName })
      );
      for (const eventSourceMapping of response.EventSourceMappings || []) {
        if (eventSourceMapping.SelfManagedKafkaEventSourceConfig) {
          console.log(
            `Disabling all Kafka triggers for function:  ${functionName}`
          );
          await lambdaClient.send(
            new UpdateEventSourceMappingCommand({
              UUID: eventSourceMapping.UUID,
              Enabled: enabled,
            })
          );
        }
      }
    }
  } catch (error: any) {
    response.statusCode = 500;
    callback(error, response);
  } finally {
    callback(null, response);
  }
};

export const getConsumerGroupStatus: Handler = async (
  event,
  context,
  callback
) => {
  const response = {
    statusCode: 200,
    ready: false,
  };
  try {
    if (!process.env.functions) {
      throw "process.env.functions cannot be undefined";
    }
    const triggerInfo: any[] = [];
    for (const functionName of process.env.functions.split(",")) {
      console.log(`Getting consumer groups for function:  ${functionName}`);
      triggerInfo.push(...(await getConsumerGroupInfo(functionName)));
    }
    const kafka = new Kafka({
      clientId: "consumerGroupResetter",
      brokers: process.env.brokerString?.split(",") || [],
      ssl: true,
    });
    const admin = kafka.admin();
    const info = await admin.describeGroups(triggerInfo.map((a) => a.groupId));
    const statuses = info.groups.map((a) => a.state.toString());
    console.log(statuses);
    await admin.disconnect();
    response.ready = !statuses.includes("Stable") ? true : false;
    console.log(response);
  } catch (error) {
    console.error(error);
    throw "asdf";
  } finally {
    callback(null, response);
  }
};

export const resetConsumerGroups: Handler = async () => {
  try {
    if (!process.env.functions) {
      throw "process.env.functions cannot be undefined";
    }
    const triggerInfo: any[] = [];
    for (const functionName of process.env.functions.split(",")) {
      console.log(`Getting consumer groups for function:  ${functionName}`);
      triggerInfo.push(...(await getConsumerGroupInfo(functionName)));
    }
    const kafka = new Kafka({
      clientId: "consumerGroupResetter",
      brokers: process.env.brokerString?.split(",") || [],
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
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteIndex: Handler = async () => {
  try {
    if (!process.env.osDomain) {
      throw "process.env.osDomain cannot be undefined";
    }
    await os.deleteIndex(process.env.osDomain, "main");
    await os.deleteIndex(process.env.osDomain, "changelog");
    await os.deleteIndex(process.env.osDomain, "seatool");
    await os.deleteIndex(process.env.osDomain, "types");
    await os.deleteIndex(process.env.osDomain, "subtypes");
  } catch (error: any) {
    if (error.meta.body.error.type == "index_not_found_exception") {
      console.log("Index does not exist.");
    } else {
      console.error(error);
      throw error;
    }
  }
};
