import { Handler } from "aws-lambda";
import { LambdaClient, ListEventSourceMappingsCommand, UpdateEventSourceMappingCommand } from "@aws-sdk/client-lambda";

export const handler: Handler = async (event, context, callback) => {
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