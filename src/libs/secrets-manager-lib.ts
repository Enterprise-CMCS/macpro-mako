import {
  SecretsManagerClient,
  GetSecretValueCommand,
  ListSecretsCommand,
} from "@aws-sdk/client-secrets-manager";

export const getSecretsValue = async (region: string, secretId: string) => {
  const client = new SecretsManagerClient({ region });
  const input = { SecretId: secretId };
  const command = new GetSecretValueCommand(input);

  try {
    const response = await client.send(command);
    const result = JSON.parse(response.SecretString ?? "");
    return result;
  } catch (e) {
    console.log("ERROR getting secrets value", JSON.stringify(e, null, 2));
  }
};

export const doesSecretExist = async (region: string, secretId: string) => {
  const client = new SecretsManagerClient({ region });
  const input = { Filters: [{ Key: "name", Values: [secretId] }] };
  const command = new ListSecretsCommand(input);
  const { SecretList } = await client.send(command);

  if (SecretList) return SecretList.some((secret) => secret.Name === secretId);
  else return;
};
