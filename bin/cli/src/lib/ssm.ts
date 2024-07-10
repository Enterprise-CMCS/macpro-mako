import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

/**
 * Fetches the value of an SSM parameter.
 *
 * @param {string} parameterName - The name of the SSM parameter to retrieve.
 * @returns {Promise<string>} - The value of the specified SSM parameter.
 * @throws {Error} - If the parameter is not found or an error occurs.
 */
export async function fetchSSMParameter(
  parameterName: string,
  region: string = "us-east-1",
): Promise<string> {
  const client = new SSMClient({ region });
  const command = new GetParameterCommand({ Name: parameterName });

  try {
    const response = await client.send(command);
    if (!response.Parameter || !response.Parameter.Value) {
      throw new Error(`Parameter not found: ${parameterName}`);
    }
    return response.Parameter.Value;
  } catch (error: any) {
    throw new Error(`Error fetching parameter: ${error}`);
  }
}
