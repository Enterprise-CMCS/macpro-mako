import { Runtime, RuntimeFamily } from "aws-cdk-lib/aws-lambda";

// aws-cdk-lib in this repo predates the static NODEJS_22_X constant,
// so model the supported Lambda runtime explicitly.
export const lambdaRuntime = new Runtime("nodejs22.x", RuntimeFamily.NODEJS, {
  supportsInlineCode: true,
});
