import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const REGION = "us-east-1";

export async function getDeploymentConfig(stage: string, project: string) {
  const ssm = new SSMClient({ region: REGION });
  const param = await ssm.send(
    new GetParameterCommand({ Name: `/${project}/${stage}/deployment-config` }),
  );

  return JSON.parse(param.Parameter!.Value!);
}

export async function getSecret(secretArn: string): Promise<string> {
  const secretsManager = new SecretsManagerClient({ region: REGION });
  const secret = await secretsManager.send(new GetSecretValueCommand({ SecretId: secretArn }));
  return secret.SecretString!;
}
