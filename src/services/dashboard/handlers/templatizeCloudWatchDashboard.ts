/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CloudWatch } from "@aws-sdk/client-cloudwatch";
import { checkEnvVars } from "../../../libs";

/**
 * It takes a string and a dictionary of strings and replaces all the keys in the dictionary with their
 * values in the string
 * @param {string} string - The string to replace values in.
 * @param replacables - Record<string, string>
 * @returns A function that takes a string and an object and returns a string.
 */
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

/**
 * It takes a CloudWatch dashboard template and replaces the values of the dashboard with the values of
 * the environment variables
 * @param {APIGatewayEvent} _event - APIGatewayEvent - This is the event that is passed to the lambda
 * function.
 * @param {Context} _context - Context - This is the context object that is passed to the lambda
 * function.
 * @param {APIGatewayProxyCallback} _callback - APIGatewayProxyCallback - This is the callback function
 * that is called when the lambda is done executing.
 * @returns The dashboard template with the values replaced with the serverless variables.
 */
export const handler = async () => {
  try {
    // Environment variables passed to lambda from serverless.yml
    checkEnvVars(["service", "accountId", "stage", "region"]);
    const { service, accountId, stage, region } = process.env;
    const client = new CloudWatch({});
    const dashboard = await client.getDashboard({
      DashboardName: `${service}-${stage}`,
    });

    const replacables = {
      [accountId!]: "${aws:accountId}",
      [stage!]: "${sls:stage}",
      [region!]: "${env:REGION_A}",
      [service!]: "${self:service}",
    };
    const templateJson = dashboard.DashboardBody;
    const results = replaceStringValues(templateJson, replacables);
    return results;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
