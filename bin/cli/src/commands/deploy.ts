import { Argv } from "yargs";
import { LabeledProcessRunner, writeUiEnvFile } from "../lib/";
import path from "path";
import { execSync } from "child_process";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { S3Client } from "@aws-sdk/client-s3";
import { S3SyncClient } from "s3-sync-client";
import mime from "mime-types";

const runner = new LabeledProcessRunner();

export const deploy = {
  command: "deploy",
  describe: "deploy the project",
  builder: (yargs: Argv) => {
    return yargs.option("stage", { type: "string", demandOption: true });
  },
  handler: async (options: { stage: string; stack?: string }) => {
    await runner.run_command_and_output(
      "CDK Deploy",
      ["cdk", "deploy", "-c", `stage=${options.stage}`, "--all"],
      ".",
    );

    await writeUiEnvFile(options.stage);

    await runner.run_command_and_output(
      "Build",
      ["bun", "run", "build"],
      "react-app",
    );

    const { s3BucketName, cloudfrontDistributionId } = JSON.parse(
      (
        await new SSMClient({ region: "us-east-1" }).send(
          new GetParameterCommand({
            Name: `/${process.env.PROJECT}/${options.stage}/deployment-output`,
          }),
        )
      ).Parameter!.Value!,
    );

    if (!s3BucketName || !cloudfrontDistributionId) {
      throw new Error("Missing necessary CloudFormation exports");
    }

    const buildDir = path.join(__dirname, "../../../react-app", "dist");

    try {
      execSync(`find ${buildDir} -type f -exec touch -t 202001010000 {} +`);
    } catch (error) {
      console.error("Failed to set fixed timestamps:", error);
    }

    const { sync } = new S3SyncClient({
      client: new S3Client({ region: process.env.REGION_A }),
    });

    await sync(buildDir, `s3://${s3BucketName}`, {
      del: true,
      commandInput: (input) => ({
        ContentType: mime.lookup(input.Key) || "text/html",
      }),
    });

    const cloudfrontClient = new CloudFrontClient({
      region: process.env.REGION_A,
    });
    const invalidationParams = {
      DistributionId: cloudfrontDistributionId,
      InvalidationBatch: {
        CallerReference: `${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: ["/*"],
        },
      },
    };

    await cloudfrontClient.send(
      new CreateInvalidationCommand(invalidationParams),
    );

    console.log(
      `Deployed UI to S3 bucket ${s3BucketName} and invalidated CloudFront distribution ${cloudfrontDistributionId}`,
    );
  },
};
