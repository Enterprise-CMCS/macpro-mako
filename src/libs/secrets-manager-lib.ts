import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export const getSecretsValue = async (region: string, secretId: string) => {
  const client = new SecretsManagerClient({ region });
  const input = { SecretId: secretId };
  const command = new GetSecretValueCommand(input);

  try {
    const response = await client.send(command);
    const result = response.SecretString ?? "";
    return result;
  } catch (e) {
    console.log("ERROR getting secrets value", JSON.stringify(e, null, 2));
  }
};
