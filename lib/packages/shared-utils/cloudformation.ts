import {
  CloudFormationClient,
  ListExportsCommand,
} from "@aws-sdk/client-cloudformation";

export async function getExport(
  exportName: string,
  region: string = "us-east-1",
): Promise<string> {
  const client = new CloudFormationClient({ region });
  const command = new ListExportsCommand({});

  try {
    const response = await client.send(command);
    const exports = response.Exports || [];
    const exportItem = exports.find((exp) => exp.Name === exportName);
    if (!exportItem) {
      throw new Error(`Export with name ${exportName} does not exist.`);
    }
    return exportItem.Value!;
  } catch (error) {
    console.error(`Error getting export value: ${error}`);
    throw error;
  }
}
