import { DescribeExecutionCommand, SFNClient } from "@aws-sdk/client-sfn";
import { Handler } from "aws-lambda";

type ReindexCompleteEvent = {
  RequestType?: string;
  PhysicalResourceId?: string;
  Data?: {
    ExecutionArn?: string;
  };
};

const TERMINAL_FAILURE_STATUSES = new Set(["FAILED", "TIMED_OUT", "ABORTED"]);
// CDK Provider totalTimeout max is 1 hour. Healthy SEA Tool + CDC replays can run
// longer, so after this window we hand off while the state machine continues.
const HANDOFF_AFTER_MS = 45 * 60 * 1000;

export const handler: Handler<ReindexCompleteEvent> = async (event) => {
  if (event.RequestType !== "Create") {
    return { IsComplete: true };
  }

  const executionArn = event.Data?.ExecutionArn || event.PhysicalResourceId;
  if (!executionArn || executionArn === "static") {
    throw new Error("Missing reindex execution ARN for Create completion check");
  }

  const stepFunctionsClient = new SFNClient({
    region: process.env.region,
  });
  const execution = await stepFunctionsClient.send(
    new DescribeExecutionCommand({
      executionArn,
    }),
  );

  if (execution.status === "RUNNING" || execution.status === "PENDING_REDRIVE") {
    const startedAt = execution.startDate ? new Date(execution.startDate).getTime() : Date.now();
    const runningMs = Date.now() - startedAt;
    if (runningMs >= HANDOFF_AFTER_MS) {
      console.log(
        `Reindex execution ${executionArn} still running after ${runningMs}ms; handing off before provider timeout`,
      );
      return {
        IsComplete: true,
        Data: {
          ExecutionArn: executionArn,
          Status: execution.status,
          HandedOff: true,
        },
      };
    }

    return { IsComplete: false };
  }

  if (execution.status === "SUCCEEDED") {
    return {
      IsComplete: true,
      Data: {
        ExecutionArn: executionArn,
        Status: execution.status,
      },
    };
  }

  if (execution.status && TERMINAL_FAILURE_STATUSES.has(execution.status)) {
    const details = [execution.error, execution.cause].filter(Boolean).join(": ");
    throw new Error(
      `Reindex execution ${executionArn} ended with status ${execution.status}${
        details ? ` (${details})` : ""
      }`,
    );
  }

  throw new Error(
    `Reindex execution ${executionArn} returned unexpected status ${execution.status}`,
  );
};
