import { CloudWatch } from "@aws-sdk/client-cloudwatch";
import type {
  APIGatewayEvent,
  APIGatewayProxyCallback,
  Context,
} from "aws-lambda";

export const replaceStringValues = (
  string: string,
  replacables: { [key: string]: string }
) => {
  let result = string;

  for (const [key, value] of Object.entries(replacables)) {
    result = result.replaceAll(key, value);
  }
  return result;
};

export const handler = async (
  _event: APIGatewayEvent,
  _context: Context,
  _callback: APIGatewayProxyCallback
) => {
  //environment variables passed to lambda from serverless.yml
  const service = process.env.service!;
  const accountId = process.env.accountId!;
  const stage = process.env.stage!;
  const region = process.env.region!;

  const client = new CloudWatch({});
  const dashboard = await client.getDashboard({
    DashboardName: `${stage}-dashboard`,
  });

  const replacables = {
    [accountId]: "${aws:accountId}",
    [stage]: "${sls:stage}",
    [region]: "${env:REGION_A}",
    [service]: "${self:service}",
  };

  let templateJson = dashboard.DashboardBody!;

  const results = replaceStringValues(templateJson, replacables);

  return results;
};
