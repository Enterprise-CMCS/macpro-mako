import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";

export const handler: Handler = async (event, context) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  try {
    if (event.RequestType == "Create") {
      const stepFunctionsClient = new SFNClient({});
      const stateMachineArn = event.ResourceProperties.stateMachine;

      const startExecutionCommand = new StartExecutionCommand({
        stateMachineArn: stateMachineArn,
        input: JSON.stringify({
          cfnEvent: event,
          cfnContext: context,
          reindexConfig: {
            script: {
              source: `
                // Ensure consistent types
                ctx._source.id = String.valueOf(ctx._source.id);
                ctx._source.changedDate = ctx._source.changedDate != null ? 
                  new Date(ctx._source.changedDate).getTime() : null;
                ctx._source.statusDate = ctx._source.statusDate != null ? 
                  ZonedDateTime.parse(ctx._source.statusDate).toString() : null;
                ctx._source.submissionDate = ctx._source.submissionDate != null ? 
                  ZonedDateTime.parse(ctx._source.submissionDate).toString() : null;
              `
            }
          }
        }),
      });

      const execution = await stepFunctionsClient.send(startExecutionCommand);
      console.log(`State machine execution started: ${execution.executionArn}`);
      console.log(
        "The state machine is now in charge of this resource, and will notify of success or failure upon completion."
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
