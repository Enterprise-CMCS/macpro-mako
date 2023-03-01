import {
  PutMetricDataCommand,
  CloudWatchClient,
  PutMetricDataCommandInput,
} from "@aws-sdk/client-cloudwatch";
import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  PutLogEventsCommandInput,
} from "@aws-sdk/client-cloudwatch-logs";

/**
 * Sends metric data to CloudWatch
 * @param params - {
 * @returns The response from the PutMetricDataCommand.
 */
export async function sendMetricData(params: PutMetricDataCommandInput) {
  console.log("Sending metric data: ", JSON.stringify(params));
  const client = new CloudWatchClient({});
  const command = new PutMetricDataCommand(params);
  try {
    const response = await client.send(command);
    console.log("Response from sending metric data", JSON.stringify(response));
    return response;
  } catch (e) {
    console.log("Error from sending metric data", e);
  }
  return;
}

/**
 * We log an event for each email that is (or would be) sent.
 * There are four log streams 'NOMATCH-MMDL' | 'NOTFOUND-MMDL' | 'NOMATCH-APPIAN' | 'NOTFOUND-APPIAN'
 */

type LogStream =
  | "NOMATCH-MMDL"
  | "NOTFOUND-MMDL"
  | "NOMATCH-APPIAN"
  | "NOTFOUND-APPIAN";

export async function putLogsEvent({
  type,
  message,
}: {
  type: LogStream;
  message: string;
}) {
  const client = new CloudWatchLogsClient({ region: process.env.region });
  const input: PutLogEventsCommandInput = {
    logEvents: [{ message, timestamp: new Date().getTime() }],
    logGroupName: process.env.sesLogGroupName,
    logStreamName: type,
  };
  const command = new PutLogEventsCommand(input);

  try {
    const response = await client.send(command);
    console.log(
      "Response from sending log event:",
      JSON.stringify(response, null, 2)
    );
  } catch (e) {
    console.log("Error from sending log event", e);
  }
}
