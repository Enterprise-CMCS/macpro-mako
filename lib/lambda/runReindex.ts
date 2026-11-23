import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { Handler } from "aws-lambda";

type RunReindexEvent = {
  RequestType: "Create" | "Update" | "Delete";
  PhysicalResourceId?: string;
  ResourceProperties: {
    stateMachine: string;
  };
};

export const handler: Handler<RunReindexEvent> = async (event) => {
  console.log("request:", JSON.stringify(event, undefined, 2));

  if (event.RequestType === "Create") {
    const stepFunctionsClient = new SFNClient({
      region: process.env.region,
    });
    const stateMachineArn = event.ResourceProperties.stateMachine;

    const execution = await stepFunctionsClient.send(
      new StartExecutionCommand({
        stateMachineArn,
        input: JSON.stringify({
          cfnEvent: event,
        }),
      }),
    );

    console.log(`State machine execution started: ${execution.executionArn}`);

    return {
      PhysicalResourceId: execution.executionArn,
      Data: {
        ExecutionArn: execution.executionArn,
      },
    };
  }

  return {
    PhysicalResourceId: event.PhysicalResourceId || "static",
  };
};
