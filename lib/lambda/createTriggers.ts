import { Handler } from "aws-lambda";
import {
  CreateEventSourceMappingCommand,
  CreateEventSourceMappingCommandInput,
  GetEventSourceMappingCommand,
  LambdaClient,
} from "@aws-sdk/client-lambda";
import { randomUUID } from "crypto";

export const handler: Handler = async (event, _, callback) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    const lambdaClient = new LambdaClient({});
    const uuidsToCheck = [];
    for (const trigger of event.triggers) {
      for (const topic of [...new Set(trigger.topics)]) {
        const consumerGroupId = `${event.consumerGroupPrefix}${randomUUID()}`;
        console.log(
          `Creating a mapping to trigger ${trigger.function} off ${topic} with consumer group ID ${consumerGroupId}`
        );
        const createEventSourceMappingParams = {
          BatchSize: trigger.batchSize || 1000,
          Enabled: trigger.enabled ?? true,
          FunctionName: trigger.function, // assuming this ARN is provided in the event
          SelfManagedEventSource: {
            Endpoints: {
              KAFKA_BOOTSTRAP_SERVERS: event.brokerString.split(","),
            },
          },
          SelfManagedKafkaEventSourceConfig: {
            ConsumerGroupId: consumerGroupId,
          },
          SourceAccessConfigurations: [
            { Type: "VPC_SUBNET", URI: `${event.subnets[0]}` },
            { Type: "VPC_SUBNET", URI: `${event.subnets[1]}` },
            { Type: "VPC_SUBNET", URI: `${event.subnets[2]}` },
            {
              Type: "VPC_SECURITY_GROUP",
              URI: `security_group:${event.securityGroup}`,
            },
          ],
          StartingPosition: event.startingPosition || "TRIM_HORIZON",
          Topics: [topic],
        };
        console.log(JSON.stringify(createEventSourceMappingParams, null, 2));
        const command = new CreateEventSourceMappingCommand(
          createEventSourceMappingParams as CreateEventSourceMappingCommandInput
        );
        const result = await lambdaClient.send(command);
        console.log(result);
        if (createEventSourceMappingParams.Enabled) {
          uuidsToCheck.push(result.UUID);
        }
      }
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
          await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds before checking again
        }
      }
      console.log(`Mapping ${uuid} is now enabled.`);
    }
  } catch (error: any) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};
