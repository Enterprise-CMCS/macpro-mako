import { Handler } from "aws-lambda";
import { DeleteEventSourceMappingCommand, GetEventSourceMappingCommand, LambdaClient, ListEventSourceMappingsCommand } from "@aws-sdk/client-lambda";

export const handler: Handler = async (event, _, callback) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    await deleteAllTriggersForFunctions(event.Functions);
  } catch (error: any) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};

export const deleteAllTriggersForFunctions = async (functions:string[]) => {
  const lambdaClient = new LambdaClient({});
    const uuidsToCheck = [];
    for(const functionName of functions) {
      const response = await lambdaClient.send(
        new ListEventSourceMappingsCommand({ FunctionName: functionName })
      );
      for (const eventSourceMapping of response.EventSourceMappings || []) {
        if (eventSourceMapping.SelfManagedKafkaEventSourceConfig) {
          console.log(
            `Disabling all Kafka triggers for function:  ${functionName}`
          );
          await lambdaClient.send(
            new DeleteEventSourceMappingCommand({
              UUID: eventSourceMapping.UUID,
            })
          );
          uuidsToCheck.push(eventSourceMapping.UUID);
        }
      }
    }
    for (const uuid of uuidsToCheck) {
      let deleted = false;
      while (!deleted) {
        const listCommand = new GetEventSourceMappingCommand({ UUID: uuid });
        try {
          await lambdaClient.send(listCommand);
          console.log(`Waiting for mapping ${uuid} to be enabled...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        } catch(error){
          console.log(error);
          deleted = true;
        }
      }
      console.log(`Mapping ${uuid} is now deleted.`);
    }
};

import { send, SUCCESS, FAILED } from "cfn-response-async";
type ResponseStatus = typeof SUCCESS | typeof FAILED;

export const customResourceWrapper: Handler = async (event, context) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const responseData: any = {};
  let responseStatus: ResponseStatus = SUCCESS;
  try {
    if (event.RequestType == "Delete"){
      await (deleteAllTriggersForFunctions(event.ResourceProperties.Functions));
    }
  } catch (error) {
    console.error(error);
    responseStatus = FAILED;
  } finally {
    await send(event, context, responseStatus, responseData, "static");
  }
};
