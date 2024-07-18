import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export async function fetchSSMParameter({
  secretName,
  region = "us-east-1",
}: {
  secretName: string;
  region?: string;
}): Promise<string> {
  const client = new SecretsManagerClient({ region });

  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);

  if (!response.SecretString) {
    throw new Error("SecretString is undefined");
  }

  return response.SecretString;
}
