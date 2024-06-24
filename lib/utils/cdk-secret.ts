import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export function getSecret(
  scope: Construct,
  project: string,
  stage: string,
  secretNameSuffix: string
) {
  const primarySecretName = `${project}/${stage}/${secretNameSuffix}`;
  const fallbackSecretName = `${project}/default/${secretNameSuffix}`;

  try {
    return secretsmanager.Secret.fromSecretNameV2(
      scope,
      `Secret-${primarySecretName}`,
      primarySecretName
    );
  } catch (e) {
    console.warn(
      `Secret ${primarySecretName} not found, checking fallback secret ${fallbackSecretName}`
    );
  }

  try {
    return secretsmanager.Secret.fromSecretNameV2(
      scope,
      `Secret-${fallbackSecretName}`,
      fallbackSecretName
    );
  } catch (e) {
    throw new Error(
      `Neither secret ${primarySecretName} nor fallback secret ${fallbackSecretName} could be found.`
    );
  }
}
