import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { Handler } from "aws-lambda";
import { FAILED, send, SUCCESS } from "cfn-response-async";

export const handler: Handler = async (event, context) => {
  console.log("runReindex request:", JSON.stringify(event, undefined, 2));
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
    await send(event, context, FAILED, {}, "static");
  }
};
