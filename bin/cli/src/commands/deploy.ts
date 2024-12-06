import { Argv } from "yargs";
import { checkIfAuthenticated, runCommand, project, region, writeUiEnvFile } from "../lib/";
import path from "path";
import { execSync } from "child_process";
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

export const deploy = {
  command: "deploy",
  describe: "deploy the project",
  builder: (yargs: Argv) => {
    return yargs.option("stage", { type: "string", demandOption: true });
  },
  handler: async (options: { stage: string; stack?: string }) => {
    await checkIfAuthenticated();
    await runCommand("cdk", ["deploy", "-c", `stage=${options.stage}`, "--all"], ".");

    await writeUiEnvFile(options.stage);

    await runCommand("bun", ["run", "build"], "react-app");

    const { s3BucketName, cloudfrontDistributionId } = JSON.parse(
      (
        await new SSMClient({ region: "us-east-1" }).send(
          new GetParameterCommand({
            Name: `/${project}/${options.stage}/deployment-output`,
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

    // There's a mime type issue when aws s3 syncing files up
    // Empirically, this issue never presents itself if the bucket is cleared just before.
    // Until we have a neat way of ensuring correct mime types, we'll remove all files from the bucket.
    await runCommand("aws", ["s3", "rm", `s3://${s3BucketName}/`, "--recursive"], ".");
    await runCommand("aws", ["s3", "sync", buildDir, `s3://${s3BucketName}/`], ".");

    const cloudfrontClient = new CloudFrontClient({
      region,
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

    await cloudfrontClient.send(new CreateInvalidationCommand(invalidationParams));

    console.log(
      `Deployed UI to S3 bucket ${s3BucketName} and invalidated CloudFront distribution ${cloudfrontDistributionId}`,
    );
  },
};
