import {
  DescribeSecretCommand,
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

export async function getSecret(secretId: string, region: string = "us-east-1"): Promise<string> {
  console.log("getSecret params: ", { secretId, region });
  const client = new SecretsManagerClient({ region });
  try {
    // Check if the secret is marked for deletion
    const describeCommand = new DescribeSecretCommand({ SecretId: secretId });
    console.log("describeCommand: ", JSON.stringify(describeCommand, null, 2));

    const secretMetadata = await client.send(describeCommand);
    console.log("secretMetadata: ", JSON.stringify(secretMetadata, null, 2));
    if (secretMetadata.DeletedDate) {
      throw new Error(`Secret ${secretId} is marked for deletion and will not be used.`);
    }

    const command = new GetSecretValueCommand({ SecretId: secretId });
    console.log("getSecretValueCommand: ", JSON.stringify(command, null, 2));
    const data = await client.send(command);
    console.log(
      "response: ",
      JSON.stringify({
        ...data,
        SecretString: "redacted",
      }),
    );
    if (!data.SecretString) {
      throw `Secret ${secretId} has no SecretString field present in response`;
    }
    return data.SecretString;
  } catch (error: unknown) {
    throw new Error(`Failed to fetch secret ${secretId}: ${error}`);
  }
}
