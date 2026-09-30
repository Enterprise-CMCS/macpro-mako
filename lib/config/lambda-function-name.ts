import { createHash } from "crypto";

export const AWS_LAMBDA_FUNCTION_NAME_MAX_LENGTH = 64;
export const AWS_S3_BUCKET_NAME_MAX_LENGTH = 63;
export const AWS_ACCOUNT_ID_LENGTH = 12;
export const AWS_SES_CONFIGURATION_SET_NAME_MAX_LENGTH = 64;
export const AWS_COGNITO_DOMAIN_PREFIX_MAX_LENGTH = 63;
export const AWS_COGNITO_USER_POOL_CLIENT_ID_LENGTH = 26;

export function truncateAwsName(name: string, maxLength: number): string {
  if (name.length <= maxLength) {
    return name;
  }

  const hash = createHash("sha256").update(name).digest("hex").slice(0, 8);
  const suffix = `-${hash}`;
  return `${name.slice(0, maxLength - suffix.length)}${suffix}`;
}

export function awsLambdaFunctionName(
  project: string,
  stage: string,
  stack: string,
  id: string,
): string {
  return truncateAwsName(`${project}-${stage}-${stack}-${id}`, AWS_LAMBDA_FUNCTION_NAME_MAX_LENGTH);
}

export function awsS3AccountBucketName(prefix: string, accountId: string): string {
  const maxPrefix = AWS_S3_BUCKET_NAME_MAX_LENGTH - 1 - AWS_ACCOUNT_ID_LENGTH;
  return `${truncateAwsName(prefix, maxPrefix)}-${accountId}`;
}

export function awsCognitoDomainPrefix(prefix: string): string {
  return truncateAwsName(prefix, AWS_COGNITO_DOMAIN_PREFIX_MAX_LENGTH);
}

export function awsCognitoDomainPrefixWithClientId(prefix: string, clientId: string): string {
  const maxPrefix =
    AWS_COGNITO_DOMAIN_PREFIX_MAX_LENGTH - 1 - AWS_COGNITO_USER_POOL_CLIENT_ID_LENGTH;
  return `${truncateAwsName(prefix, maxPrefix)}-${clientId}`;
}
