import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { region } from "./consts";

export async function checkIfAuthenticated(): Promise<void> {
  try {
    const client = new STSClient({ region });
    const command = new GetCallerIdentityCommand({});
    await client.send(command);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("Could not load credentials from any providers")
      ) {
        console.error(
          `\x1b[31m\x1b[1mERROR:  This command requires AWS credentials available to your terminal. Please configure AWS credentials and try again.\x1b[0m`,
        );
      } else {
        console.error(
          "Error occurred while checking authentication:",
          error.message,
        );
      }
    } else {
      console.error("An unknown error occurred:", error);
    }
    process.exit(1);
  }
}
