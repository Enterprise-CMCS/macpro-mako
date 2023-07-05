import { Handler } from "aws-lambda";
// import { deleteItem } from "../../../libs";
import { Kafka } from "kafkajs";
import { LambdaClient, ListEventSourceMappingsCommand, UpdateEventSourceMappingCommand } from "@aws-sdk/client-lambda";

export const toggleTriggers: Handler = async () => {
  try {
    if (!process.env.functions) {
      throw "process.env.functions cannot be undefined";
    }
    const enabled = (process.env.enabled === "true");
    for (const functionName of process.env.functions.split(',')){
      const lambdaClient = new LambdaClient({});
      const response = await lambdaClient.send((new ListEventSourceMappingsCommand({ FunctionName: functionName })));
      for(const eventSourceMapping of response.EventSourceMappings || []) {
        if(eventSourceMapping.SelfManagedKafkaEventSourceConfig){
          console.log(`Disabling all Kafka triggers for function:  ${functionName}`);
          await lambdaClient.send((new UpdateEventSourceMappingCommand({
            UUID: eventSourceMapping.UUID,
            Enabled: enabled,
          })));
        }
      }
    }
  } catch(error) {
    console.error(error);
    throw (error);
  }
}

export const getConsumerGroupStatus: Handler = async (event, context, callback) => {
  let response = {
    statusCode: 200,
    ready: false,
  };
  try {
    if (!process.env.functions) {
      throw "process.env.functions cannot be undefined";
    }
    let triggerInfo = new Array();
    for (const functionName of process.env.functions.split(',')){
      console.log(`Getting consumer groups for function:  ${functionName}`);
      triggerInfo.push(...(await getConsumerGroupInfo(functionName)));
    }
    const kafka = new Kafka({
      clientId: "consumerGroupResetter",
      brokers: process.env.brokerString?.split(',') || [],
      ssl: true,
    });
    var admin = kafka.admin();
    let info = await admin.describeGroups(triggerInfo.map(a => a.groupId));
    let statuses = info.groups.map(a => a.state.toString());
    console.log(statuses);
    await admin.disconnect();
    response.ready = !statuses.includes("Stable") ? true : false;
    console.log(response);
  } catch(error) {
    console.error(error);
    throw("asdf");
  } finally {
    callback(null, response);
  }
}

export const resetConsumerGroups: Handler = async () => {
  try {
    if (!process.env.functions) {
      throw "process.env.functions cannot be undefined";
    }
    let triggerInfo = new Array();
    for (const functionName of process.env.functions.split(',')){
      console.log(`Getting consumer groups for function:  ${functionName}`);
      triggerInfo.push(...(await getConsumerGroupInfo(functionName)));
    }
    const kafka = new Kafka({
      clientId: "consumerGroupResetter",
      brokers: process.env.brokerString?.split(',') || [],
      ssl: true,
    });
    var admin = kafka.admin();
    for (const trigger of triggerInfo){
      for (const topic of trigger.topics) {
        console.log(`Resetting group ${trigger.groupId} for topic ${topic}`);
        await admin.resetOffsets({ groupId: trigger.groupId, topic, earliest: true });
      }
    }
    await admin.disconnect();
  } catch(error) {
    console.error(error);
    throw (error);
  }
}

async function getConsumerGroupInfo(functionName: string){
  const lambdaClient = new LambdaClient({});
  const response = await lambdaClient.send((new ListEventSourceMappingsCommand({ FunctionName: functionName })));
  let triggerInfo = []
  for(const eventSourceMapping of response.EventSourceMappings || []) {
    if(eventSourceMapping.SelfManagedKafkaEventSourceConfig){
      triggerInfo.push({
        groupId: eventSourceMapping.SelfManagedKafkaEventSourceConfig.ConsumerGroupId,
        topics: eventSourceMapping.Topics
      });
    }
  }
  return triggerInfo;
}
