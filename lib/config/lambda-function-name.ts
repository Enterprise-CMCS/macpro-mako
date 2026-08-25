import { createHash } from "crypto";

export const AWS_LAMBDA_FUNCTION_NAME_MAX_LENGTH = 64;

export function awsLambdaFunctionName(
  project: string,
  stage: string,
  stack: string,
  id: string,
): string {
  const fullName = `${project}-${stage}-${stack}-${id}`;
  if (fullName.length <= AWS_LAMBDA_FUNCTION_NAME_MAX_LENGTH) {
    return fullName;
  }

  const hash = createHash("sha256").update(fullName).digest("hex").slice(0, 8);
  const suffix = `-${hash}`;
  return `${fullName.slice(0, AWS_LAMBDA_FUNCTION_NAME_MAX_LENGTH - suffix.length)}${suffix}`;
}
