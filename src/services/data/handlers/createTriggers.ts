import { Handler } from "aws-lambda";
import { CreateEventSourceMappingCommand, CreateEventSourceMappingCommandInput, GetEventSourceMappingCommand, LambdaClient, ListEventSourceMappingsCommand, UpdateEventSourceMappingCommand } from "@aws-sdk/client-lambda";

export const handler: Handler = async (event, _, callback) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    const lambdaClient = new LambdaClient({});
    let uuidsToCheck = [];
    for(const trigger of event.Triggers) {
      for(const topic of [...new Set(trigger.Topics)]) {
        console.log(`would create a mapping to trigger ${trigger.Function} off ${topic}`);
        const createEventSourceMappingParams = {
          BatchSize: trigger.BatchSize || 1000,
          Enabled: true,
          FunctionName: trigger.Function, // assuming this ARN is provided in the event
          SelfManagedEventSource: {
            Endpoints: {
              KAFKA_BOOTSTRAP_SERVERS: event.BrokerString.split(",")
            },
          },
          SourceAccessConfigurations: [
            { Type: "VPC_SUBNET", URI: event.Subnets[0] },
            { Type: "VPC_SUBNET", URI: event.Subnets[1] },
            { Type: "VPC_SUBNET", URI: event.Subnets[2] },
            { Type: "VPC_SECURITY_GROUP", URI: event.SecurityGroup },
          ],
          StartingPosition: event.StartingPosition || "TRIM_HORIZON",
          Topics: [topic],
        };
        console.log(JSON.stringify(createEventSourceMappingParams,null,2));
        const command = new CreateEventSourceMappingCommand(createEventSourceMappingParams as CreateEventSourceMappingCommandInput);
        const result = await lambdaClient.send(command);
        uuidsToCheck.push(result.UUID);
        console.log(result);
      }
      for (const uuid of uuidsToCheck) {
        let isEnabled = false;
        while (!isEnabled) {
          const listCommand = new GetEventSourceMappingCommand({ UUID: uuid });
          const mappingResult = await lambdaClient.send(listCommand);
          if (mappingResult.State === "Enabled") {
            isEnabled = true;
          } else {
            console.log(`Waiting for mapping ${uuid} to be enabled...`);
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before checking again
          }
        }
        console.log(`Mapping ${uuid} is now enabled.`);
      }
    }
  } catch (error: any) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};