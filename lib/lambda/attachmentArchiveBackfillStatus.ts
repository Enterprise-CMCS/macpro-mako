import { ListExecutionsCommand, SFNClient } from "@aws-sdk/client-sfn";
import { GetQueueAttributesCommand, SQSClient } from "@aws-sdk/client-sqs";

const queueClient = new SQSClient({ region: process.env.region || process.env.AWS_REGION });
const stepFunctionsClient = new SFNClient({ region: process.env.region || process.env.AWS_REGION });

type AttachmentArchiveBackfillStatusEvent = {
  currentExecutionArn?: string;
  historicalBackfillStateMachineArn?: string;
};

function getArchiveRebuildQueueUrl() {
  const queueUrl = process.env.ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL;
  if (!queueUrl) {
    throw new Error("ATTACHMENT_ARCHIVE_REBUILD_QUEUE_URL must be defined");
  }

  return queueUrl;
}

function getArchiveStateMachineArn() {
  const stateMachineArn = process.env.ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN;
  if (!stateMachineArn) {
    throw new Error("ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN must be defined");
  }

  return stateMachineArn;
}

async function countRunningExecutions(stateMachineArn: string, currentExecutionArn?: string) {
  let nextToken: string | undefined;
  let runningCount = 0;

  do {
    const response = await stepFunctionsClient.send(
      new ListExecutionsCommand({
        stateMachineArn,
        maxResults: 100,
        nextToken,
        statusFilter: "RUNNING",
      }),
    );

    runningCount += (response.executions || []).filter(
      (execution) => execution.executionArn !== currentExecutionArn,
    ).length;

    nextToken = response.nextToken;
  } while (nextToken);

  return runningCount;
}

export const handler = async (event: AttachmentArchiveBackfillStatusEvent = {}) => {
  const queueAttributesResponse = await queueClient.send(
    new GetQueueAttributesCommand({
      AttributeNames: ["ApproximateNumberOfMessages", "ApproximateNumberOfMessagesNotVisible"],
      QueueUrl: getArchiveRebuildQueueUrl(),
    }),
  );

  const queueVisible = Number(
    queueAttributesResponse.Attributes?.ApproximateNumberOfMessages || "0",
  );
  const queueInflight = Number(
    queueAttributesResponse.Attributes?.ApproximateNumberOfMessagesNotVisible || "0",
  );
  const runningExecutions = await countRunningExecutions(getArchiveStateMachineArn());
  const otherHistoricalBackfillExecutions = event.historicalBackfillStateMachineArn
    ? await countRunningExecutions(
        event.historicalBackfillStateMachineArn,
        event.currentExecutionArn,
      )
    : 0;

  return {
    otherHistoricalBackfillExecutions,
    queueInflight,
    queueVisible,
    runningExecutions,
  };
};
