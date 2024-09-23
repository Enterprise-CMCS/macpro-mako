import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";

export const commonBundlingOptions: lambda.BundlingOptions = {
  minify: true,
  sourceMap: true,
  define: {
    __IS_FRONTEND__: "false",
  },
};
