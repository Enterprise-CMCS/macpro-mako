import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" }); // Replace with your AWS region

export async function fetchSecret(
  project: string,
  stage: string,
  secretNameSuffix: string
): Promise<any> {
  const secretName = `${project}/${stage}/${secretNameSuffix}`;

  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const data = await client.send(command);
    console.log(`Using secret at ${secretName}`);
    if (data.SecretString) {
      try {
        return JSON.parse(data.SecretString);
      } catch {
        return data.SecretString; // Return plain text if JSON parsing fails
      }
    } else if (data.SecretBinary) {
      // Handle binary data if necessary
      return data.SecretBinary;
    } else {
      throw new Error(`Secret value not found for ${secretName}`);
    }
  } catch (error: any) {
    // Fallback to default stage
    const defaultSecretName = `${project}/default/${secretNameSuffix}`;

    try {
      const defaultCommand = new GetSecretValueCommand({
        SecretId: defaultSecretName,
      });
      const defaultData = await client.send(defaultCommand);
      console.log(`Using secret at ${defaultSecretName}`);
      if (defaultData.SecretString) {
        try {
          return JSON.parse(defaultData.SecretString);
        } catch {
          return defaultData.SecretString; // Return plain text if JSON parsing fails
        }
      } else if (defaultData.SecretBinary) {
        // Handle binary data if necessary
        return defaultData.SecretBinary;
      } else {
        throw new Error(`Secret value not found for ${defaultSecretName}`);
      }
    } catch (fallbackError: any) {
      throw new Error(
        `Failed to fetch default secret ${defaultSecretName}: ${fallbackError.message}`
      );
    }
  }
}
