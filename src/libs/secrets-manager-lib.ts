import {
  SecretsManagerClient,
  GetSecretValueCommand,
  ListSecretsCommand,
} from "@aws-sdk/client-secrets-manager";

export const getSecretsValue = async (region: string, secretId: string) => {
  const client = new SecretsManagerClient({ region });
  const input = { SecretId: secretId };
  const command = new GetSecretValueCommand(input);

  console.log("client", client);
  console.log("input", input);
  console.log("command", command);
  try {
    console.log("try");
    const response = await client.send(command);
    console.log("response", response);
    const result = JSON.parse(response.SecretString ?? "");
    console.log("result", result);
    return result;
  } catch (e) {
    console.log("error2", e);
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
