import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";

export const handler: Handler = async (event, context, callback) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    if (event.RequestType == "Create") {
      const stepFunctionsClient = new SFNClient({});
      const stateMachineArn = event.ResourceProperties.stateMachine;

      const startExecutionCommand = new StartExecutionCommand({
        stateMachineArn: stateMachineArn,
        input: JSON.stringify({
          cfnEvent: event,
          cfnContext: context,
        }),
      });

      const execution = await stepFunctionsClient.send(startExecutionCommand);
      console.log(`State machine execution started: ${execution.executionArn}`);
      console.log(
        "The state machine is now in charge of this resource, and will notify of success or failure upon completion.",
      );
    } else if (event.RequestType == "Update") {
      await send(event, context, SUCCESS, {}, "static");
    } else if (event.RequestType == "Delete") {
      // need to delete all triggers here  to do
      await send(event, context, SUCCESS, {}, "static");
    }
  } catch (error) {
    console.log(error);
    response.statusCode = 500;
    errorResponse = error;
    await send(event, context, FAILED, {}, "static");
  } finally {
    callback(errorResponse, response);
  }
};
