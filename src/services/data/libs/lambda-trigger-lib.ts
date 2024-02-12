import { LambdaClient, ListEventSourceMappingsCommand } from "@aws-sdk/client-lambda";


export async function getConsumerGroupInfo(functionName: string) {
  const lambdaClient = new LambdaClient({});
  const response = await lambdaClient.send(
    new ListEventSourceMappingsCommand({ FunctionName: functionName })
  );
  const triggerInfo = [];
  for (const eventSourceMapping of response.EventSourceMappings || []) {
    if (eventSourceMapping.SelfManagedKafkaEventSourceConfig) {
      triggerInfo.push({
        groupId:
          eventSourceMapping.SelfManagedKafkaEventSourceConfig.ConsumerGroupId,
        topics: eventSourceMapping.Topics,
      });
    }
  }
  return triggerInfo;
}