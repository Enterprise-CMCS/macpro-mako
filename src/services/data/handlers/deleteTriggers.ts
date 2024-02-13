import { Handler } from "aws-lambda";
import { DeleteEventSourceMappingCommand, GetEventSourceMappingCommand, LambdaClient, ListEventSourceMappingsCommand, UpdateEventSourceMappingCommand } from "@aws-sdk/client-lambda";

export const handler: Handler = async (event, context, callback) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const response = {
    statusCode: 200,
  };
  try {
    const lambdaClient = new LambdaClient({});
    let uuidsToCheck = [];
    for(const functionName of event.Functions) {
      const response = await lambdaClient.send(
        new ListEventSourceMappingsCommand({ FunctionName: functionName })
      );
      for (const eventSourceMapping of response.EventSourceMappings || []) {
        if (eventSourceMapping.SelfManagedKafkaEventSourceConfig) {
          console.log(
            `Disabling all Kafka triggers for function:  ${functionName}`
          );
          let reply = await lambdaClient.send(
            new DeleteEventSourceMappingCommand({
              UUID: eventSourceMapping.UUID,
            })
          );
          uuidsToCheck.push(eventSourceMapping.UUID)
        }
      }
    }
    for (const uuid of uuidsToCheck) {
      let deleted = false;
      while (!deleted) {
        const listCommand = new GetEventSourceMappingCommand({ UUID: uuid });
        try {
          const mappingResult = await lambdaClient.send(listCommand);
          console.log(`Waiting for mapping ${uuid} to be enabled...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        } catch(error){
          console.log(error)
          deleted = true;
        }
      }
      console.log(`Mapping ${uuid} is now enabled.`);
    }
  } catch (error: any) {
    response.statusCode = 500;
    callback(error, response);
  } finally {
    callback(null, response);
  }
};