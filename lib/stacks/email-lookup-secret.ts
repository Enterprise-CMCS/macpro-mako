/** Secrets Manager ARN pattern for the email address lookup secret. */
export function emailLookupSecretArn(region: string, account: string, secretName: string): string {
  return `arn:aws:secretsmanager:${region}:${account}:secret:${secretName}-*`;
}
