import { CloudWatch } from "@aws-sdk/client-cloudwatch";
import type {
  APIGatewayEvent,
  APIGatewayProxyCallback,
  Context,
} from "aws-lambda";

export const replaceStringValues = (
  string: string,
  replacables: Record<string, string>
) => {
  const result = string.replace(
    new RegExp(Object.keys(replacables).join("|"), "gi"),
    (matched) => replacables[matched]
  );
  return result;
};

export const handler = async (
  _event: APIGatewayEvent,
  _context: Context,
  _callback: APIGatewayProxyCallback
) => {
  try {
    // Environment variables passed to lambda from serverless.yml
    const { service, accountId, stage, region } = process.env;
    const client = new CloudWatch({});
    const dashboard = await client.getDashboard({
      DashboardName: `${stage}-dashboard`,
    });

    const replacables = {
      [accountId!]: "${aws:accountId}",
      [stage!]: "${sls:stage}",
      [region!]: "${env:REGION_A}",
      [service!]: "${self:service}",
    };
    const templateJson = dashboard.DashboardBody!;
    const results = replaceStringValues(templateJson, replacables);
    return results;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
