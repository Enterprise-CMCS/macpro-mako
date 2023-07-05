import { Handler } from "aws-lambda";
// import { deleteItem } from "../../../libs";
import { Kafka, ConfigResourceTypes } from "kafkajs";
import { LambdaClient, ListEventSourceMappingsCommand, UpdateEventSourceMappingCommand } from "@aws-sdk/client-lambda"
export const handler: Handler = async () => {
  try {
    if (!process.env.tableName) {
      throw "process.env.tableName cannot be undefined";
    }

    if (!process.env.functions) {
      throw "process.env.functions cannot be undefined";
    }

    let functions = process.env.functions.split(',');
    let triggerInfo = new Array();
    
    // First, disable all triggers, and collect the consumerGroupIds
    for (const functionName of functions){
      console.log(`Disabling all Kafka triggers for function:  ${functionName}`);
      triggerInfo.push(...(await toggleTriggers(functionName, false)));
    }
    console.log(`Found consumer group IDs:  ${triggerInfo.map(a => a.groupId)}`);
    
    // Second, wait until the consumer group ids are inactive
    const kafka = new Kafka({
      clientId: "consumerGroupResetter",
      brokers: process.env.brokerString?.split(',') || [],
      ssl: true,
    });
    var admin = kafka.admin();
    while(true) {
      let info = await admin.describeGroups(triggerInfo.map(a => a.groupId));
      let statuses = info.groups.map(a => a.state.toString());
      console.log(statuses);
      if(!statuses.includes('Stable')){
        console.log("All consumer groups are inactive");
        break;
      }
      await new Promise(r => setTimeout(r, 10000));
    }

    // Third, reset the consumer group to the earliest offset
    for (const trigger of triggerInfo){
      for (const topic of trigger.topics) {
        console.log(`Resetting group ${trigger.groupId} for topic ${topic}`);
        await admin.resetOffsets({ groupId: trigger.groupId, topic, earliest: true });
      }
    }

    await admin.disconnect();

    // Fourth, enable all triggers
    for (const functionName of functions){
      console.log(`Enabling all Kafka triggers for function:  ${functionName}`);
      await toggleTriggers(functionName, true);
    }

  } catch (error) {
    console.error(error);
    throw (error);
  }
};

async function toggleTriggers(functionName: string, enabled: boolean) {
  const lambdaClient = new LambdaClient({});
  const response = await lambdaClient.send((new ListEventSourceMappingsCommand({ FunctionName: functionName })));
  let triggerInfo = []
  for(const eventSourceMapping of response.EventSourceMappings || []) {
    if(eventSourceMapping.SelfManagedKafkaEventSourceConfig){
      triggerInfo.push({
        groupId: eventSourceMapping.SelfManagedKafkaEventSourceConfig.ConsumerGroupId,
        topics: eventSourceMapping.Topics
      });
      await lambdaClient.send((new UpdateEventSourceMappingCommand({
        UUID: eventSourceMapping.UUID,
        Enabled: enabled
      })));
    }
  }
  return triggerInfo;
}
