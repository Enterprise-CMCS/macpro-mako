import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";

export const handler: Handler = async (event, context, callback) => {
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    if (event.RequestType == "Create") {
      const stepFunctionsClient = new SFNClient({
        region: process.env.region,
      });
      const stateMachineArn = event.ResourceProperties.stateMachine;

      const startExecutionCommand = new StartExecutionCommand({
        stateMachineArn: stateMachineArn,
        input: JSON.stringify({
          cfnEvent: event,
          cfnContext: context,
        }),
      });

      const execution = await stepFunctionsClient.send(startExecutionCommand);
      console.log(`State machine execution started with ARN: ${execution.executionArn}`);
    } else if (event.RequestType == "Update") {
      await send(event, context, SUCCESS);
    } else if (event.RequestType == "Delete") {
      await send(event, context, SUCCESS);
    }
  } catch (error) {
    console.error("Reindexing failed with error:", error);
    response.statusCode = 500;
    errorResponse = error;
    await send(event, context, FAILED);
  } finally {
    callback(errorResponse, response);
  }
};
