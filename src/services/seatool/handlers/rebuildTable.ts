import { Handler } from "aws-lambda";
// import { deleteItem } from "../../../libs";
// import { Kafka, ConfigResourceTypes } from "kafkajs";
import { LambdaClient, ListEventSourceMappingsCommand } from "@aws-sdk/client-lambda"
export const handler: Handler = async () => {
  try {
    if (!process.env.tableName) {
      throw "process.env.tableName cannot be undefined";
    }

    if (!process.env.functions) {
      throw "process.env.functions cannot be undefined";
    }

    let functions = process.env.functions.split(',');
    let consumerGroupIds = [];
    for (const functionName of functions){
      consumerGroupIds.push(...(await getConsumerGroupIdsForFunction(functionName)));
    }
    console.log(consumerGroupIds);


    // const kafka = new Kafka({
    //   clientId: "createTopics",
    //   brokers: brokers,
    //   ssl: true,
    // });
    // var admin = kafka.admin();


  } catch (error) {
    console.error(error);
    throw (error);
  }
};

async function getConsumerGroupIdsForFunction(functionName: string) {
  const lambdaClient = new LambdaClient({});
  const response = await lambdaClient.send((new ListEventSourceMappingsCommand({ FunctionName: functionName })));
  let consumerGroupIds = []
  for(const eventSourceMapping of response.EventSourceMappings || []) {
    if(eventSourceMapping.SelfManagedKafkaEventSourceConfig){
      consumerGroupIds.push(eventSourceMapping.SelfManagedKafkaEventSourceConfig.ConsumerGroupId);
    }
  }
  return consumerGroupIds

}
