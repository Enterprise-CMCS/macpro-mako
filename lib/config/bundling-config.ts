import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";

export const commonBundlingOptions: lambda.BundlingOptions = {
  esbuildArgs: {
    "--loader:.png=dataurl": true,
    '--define:window="undefined"': true,
    '--define:document="undefined"': true,
    '--define:navigator="undefined"': true,
    '--define:canvas="undefined"': true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "global.window": "undefined",
    "global.document": "undefined",
    "global.navigator": "undefined",
    "global.canvas": "undefined",
    __IS_FRONTEND__: "false",
  },
  minify: true,
  sourceMap: true,
};
