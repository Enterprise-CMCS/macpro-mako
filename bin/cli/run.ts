import yargs from "yargs";
import * as dotenv from "dotenv";
import LabeledProcessRunner from "./runner.js";
import { SecurityHubJiraSync } from "@enterprise-cmcs/macpro-security-hub-sync";
import path from "path";
import { promises as fs } from "fs"; // Import fs module
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { execSync } from "child_process";
import * as readlineSync from "readline-sync";
import {
  CloudFormationClient,
  DeleteStackCommand,
  waitUntilStackDeleteComplete,
} from "@aws-sdk/client-cloudformation";
// import open from "open";

// load .env
dotenv.config();

const runner = new LabeledProcessRunner();

async function install_deps(runner: LabeledProcessRunner) {
  await runner.run_command_and_output(
    `Installing Dependencies`,
    ["yarn"],
    ".",
    true,
  );
}

yargs
  .command("install", "install all service dependencies", {}, async () => {
    await install_deps(runner);
  })
  .command(
    "deploy",
    "deploy the project",
    {
      stage: { type: "string", demandOption: true },
      stack: { type: "string", demandOption: false },
    },
    async (options) => {
      await install_deps(runner);
      const baseCmd = ["cdk", "deploy", "-c", `stage=${options.stage}`];

      if (options.stack) {
        if (options.stack === "ui") {
          deployUiToAws(options.stage);
        } else {
          await runner.run_command_and_output(
            "CDK Deploy",
            [
              ...baseCmd,
              `${process.env.PROJECT}-${options.stack}-${options.stage}`,
            ],
            ".",
          );
        }
      } else {
        await runner.run_command_and_output(
          "CDK Deploy",
          [...baseCmd, "--all"],
          ".",
        );
        deployUiToAws(options.stage);
      }
    },
  )
  .command(
    "ui",
    "Run react-server locally against an aws backend",
    {
      stage: { type: "string", demandOption: true },
    },
    async (options) => {
      await install_deps(runner);
      await runLocalUiAgainstAwsBackend(options.stage);
    },
  )
  .command(
    "test",
    "run all available tests.",
    {
      stage: { type: "string", demandOption: true },
    },
    async (options) => {
      await install_deps(runner);
      await runner.run_command_and_output(`Unit Tests`, ["yarn", "test"], ".");
      await runner.run_command_and_output(
        `Load test data`,
        ["sls", "database", "seed", "--stage", options.stage],
        ".",
      );
    },
  )
  .command(
    "e2e",
    "run e2e tests.",
    {
      ui: { type: "boolean", demandOption: false, default: false },
    },
    async (argv: any) => {
      await install_deps(runner);
      await runner.run_command_and_output(
        `Install playwright`,
        ["yarn", "playwright", "install", "--with-deps"],
        ".",
      );

      if (argv.ui) {
        await runner.run_command_and_output(
          `e2e:ui tests`,
          ["yarn", "e2e:ui"],
          ".",
        );
      } else {
        await runner.run_command_and_output(`e2e tests`, ["yarn", "e2e"], ".");
      }
    },
  )
  .command("test-gui", "open unit-testing gui for vitest.", {}, async () => {
    await install_deps(runner);
    await runner.run_command_and_output(
      `Unit Tests`,
      ["yarn", "test-gui"],
      ".",
    );
  })
  .command(
    "destroy",
    "destroy a stage in AWS",
    {
      stage: { type: "string", demandOption: true },
      wait: { type: "boolean", demandOption: false, default: true },
      verify: { type: "boolean", demandOption: false, default: true },
    },
    async (options) => {
      const stackName = `${process.env.PROJECT}-${options.stage}`;

      // Check if the stage contains "prod" (case insensitive)
      if (/prod/i.test(options.stage)) {
        console.log("Error: Destruction of production stages is not allowed.");
        process.exit(1);
      }

      if (options.verify) {
        await confirmDestroyCommand(stackName);
      }

      try {
        const cloudFormationClient = new CloudFormationClient({
          region: process.env.REGION_A,
        });

        const waitForStackDeleteComplete = async (stackName) => {
          const params = { StackName: stackName };
          const waiterConfig = {
            client: cloudFormationClient,
            maxWaitTime: 3600, // maximum wait time in seconds (1 hour)
          };
          return waitUntilStackDeleteComplete(waiterConfig, params);
        };

        // Initiate stack deletion
        const deleteStackCommand = new DeleteStackCommand({
          StackName: stackName,
        });
        await cloudFormationClient.send(deleteStackCommand);
        console.log(`Stack ${stackName} delete initiated.`);

        if (options.wait) {
          console.log(`Waiting for stack ${stackName} to be deleted...`);

          // Wait until stack deletion is complete
          const result = await waitForStackDeleteComplete(stackName);
          if (result.state === "SUCCESS") {
            console.log(`Stack ${stackName} deleted successfully.`);
          } else {
            console.error(`Error: Stack ${stackName} deletion failed.`);
          }
        } else {
          console.log(
            `Stack ${stackName} delete initiated. Not waiting for completion as --wait is set to false.`,
          );
        }
      } catch (error) {
        console.error(`Error deleting stack ${stackName}:`, error);
      }
    },
  )
  .command(
    "docs",
    "Starts the Jekyll documentation site in a docker container, available on http://localhost:4000.",
    {
      stop: { type: "boolean", demandOption: false, default: false },
    },
    async (options) => {
      // Always clean up first...
      await runner.run_command_and_output(
        `Stop any existing container.`,
        ["docker", "rm", "-f", "jekyll"],
        "docs",
      );

      // If we're starting...
      if (!options.stop) {
        await runner.run_command_and_output(
          `Run docs at http://localhost:4000`,
          [
            "docker",
            "run",
            "--rm",
            "-i",
            "-v",
            `${process.cwd()}/docs:/site`,
            "--name",
            "jekyll",
            "--pull=always",
            "-p",
            "0.0.0.0:4000:4000",
            "bretfisher/jekyll-serve",
            "sh",
            "-c",
            "bundle install && bundle exec jekyll serve --force_polling --host 0.0.0.0",
          ],
          "docs",
        );
      }
    },
  )
  .command(
    ["securityHubJiraSync", "securityHubSync", "secHubSync"],
    "Create Jira Issues for Security Hub findings.",
    {},
    async () => {
      await install_deps(runner);
      await new SecurityHubJiraSync({
        customJiraFields: {
          customfield_14117: [{ value: "Platform Team" }],
          customfield_14151: [{ value: "Not Applicable " }],
          customfield_14068:
            "* All findings of this type are resolved or suppressed, indicated by a Workflow Status of Resolved or Suppressed.  (Note:  this ticket will automatically close when the AC is met.)",
        },
      }).sync();
    },
  )
  // .command(
  //   ["open-kibana", "open-os"],
  //   "Open the Kibana dashboard, the frontend for OpenSearch.",
  //   {
  //     stage: { type: "string", demandOption: true },
  //   },
  //   async (options) => {
  //     let url = await getCloudFormationOutputValue(
  //       "data",
  //       options.stage,
  //       "OpenSearchDashboardEndpoint"
  //     );
  //     open(url);
  //   }
  // )
  // .command(
  //   ["open-app"],
  //   "Open the Kibana dashboard, the frontend for OpenSearch.",
  //   {
  //     stage: { type: "string", demandOption: true },
  //   },
  //   async (options) => {
  //     let url = await getCloudFormationOutputValue(
  //       "ui-infra",
  //       options.stage,
  //       "ApplicationEndpointUrl"
  //     );
  //     open(url);
  //   }
  // )
  .strict() // This errors and prints help if you pass an unknown command
  .scriptName("run") // This modifies the displayed help menu to show 'run' isntead of 'dev.js'
  .demandCommand(1, "").argv; // this prints out the help if you don't call a subcommand

// async function getCloudFormationOutputValue(
//   service: string,
//   stage: string,
//   outputKey: string,
//   region: string = ""
// ): Promise<string> {
//   const cliRegion = region !== "" ? region : process.env.REGION_A;
//   const client = new CloudFormationClient({ region: cliRegion });
//   const stackName = `${process.env.PROJECT}-${service}-${stage}`;
//   const command = new DescribeStacksCommand({
//     StackName: stackName,
//   });

//   try {
//     const response = await client.send(command);
//     const stack = response.Stacks?.[0];
//     const outputValue = stack?.Outputs?.find(
//       (output) => output.OutputKey === outputKey
//     )?.OutputValue;
//     if (outputValue === undefined || outputValue.trim() === "") {
//       throw new Error("Output not found");
//     }
//     return outputValue;
//   } catch (error) {
//     console.error(
//       `Failed to retrieve output [${outputKey}] from stack [${stackName}]:`,
//       error
//     );
//     throw error; // Rethrow or handle as needed
//   }
// }
async function runLocalUiAgainstAwsBackend(stage) {
  await writeEnvFileForUi(stage, true);
  await runner.run_command_and_output(`Build`, ["yarn", "build"], "react-app");
  await runner.run_command_and_output(`Run`, ["yarn", "dev"], `react-app`);
}
async function deployUiToAws(stage) {
  await writeEnvFileForUi(stage);
  await runner.run_command_and_output(`Build`, ["yarn", "build"], "react-app");

  const s3BucketName = await fetchDeployOutput(
    "ui-infra",
    stage,
    "s3BucketName",
  );
  const cloudfrontDistributionId = await fetchDeployOutput(
    "ui-infra",
    stage,
    "cloudfrontDistributionId",
  );

  if (!s3BucketName || !cloudfrontDistributionId) {
    throw new Error("Missing necessary CloudFormation exports");
  }

  // Upload build files to S3
  const buildDir = path.join(__dirname, "..", "react-app", "dist");

  // This fixes all bucket files timestamp, so deploys are idempotent
  const setFixedTimestamp = (dir) => {
    const fixedTimestamp = "202001010000"; // Fixed timestamp: January 1, 2020, 00:00
    try {
      // This command works for both Ubuntu and macOS
      execSync(`find ${dir} -type f -exec touch -t ${fixedTimestamp} {} +`);
    } catch (error) {
      console.error("Failed to set fixed timestamps:", error);
    }
  };

  setFixedTimestamp(buildDir);

  await runner.run_command_and_output(
    `S3 Sync`,
    ["aws", "s3", "sync", buildDir, `s3://${s3BucketName}/`, "--delete"],
    ".",
  );

  // Create CloudFront invalidation
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
}

async function writeEnvFileForUi(stage, local = false) {
  const exportKeys = {
    "ui-infra": [
      `cloudfrontDistributionId`,
      `s3BucketName`,
      `applicationEndpointUrl`,
    ],
    api: [`apiGatewayRestApiUrl`],
    auth: [
      `identityPoolId`,
      `userPoolId`,
      `userPoolClientId`,
      `userPoolClientDomain`,
    ],
  };

  const secrets = {};
  for (const [stack, keys] of Object.entries(exportKeys)) {
    for (const key of keys) {
      secrets[key] = await fetchDeployOutput(stack, stage, key);
    }
  }

  const googleAnalytics = await fetchSecret(
    process.env.PROJECT!,
    stage,
    "googleAnalytics",
  );
  const launchdarklyClientID = await fetchSecret(
    process.env.PROJECT!,
    stage,
    "launchdarklyClientID",
  );
  const idmInfo = await fetchSecret(process.env.PROJECT!, stage, "idmInfo");

  const envVariables = {
    VITE_API_REGION: `"${process.env.REGION_A}"`,
    VITE_API_URL: `"${secrets["apiGatewayRestApiUrl"]}"`,
    VITE_NODE_ENV: `"development"`,
    VITE_COGNITO_REGION: `"${process.env.REGION_A}"`,
    VITE_COGNITO_IDENTITY_POOL_ID: `"${secrets["identityPoolId"]}"`,
    VITE_COGNITO_USER_POOL_ID: `"${secrets["userPoolId"]}"`,
    VITE_COGNITO_USER_POOL_CLIENT_ID: `"${secrets["userPoolClientId"]}"`,
    VITE_COGNITO_USER_POOL_CLIENT_DOMAIN: `"${secrets["userPoolClientDomain"]}"`,
    VITE_COGNITO_REDIRECT_SIGNIN: local
      ? `"http://localhost:5000/"`
      : `"${secrets["applicationEndpointUrl"]}"`,
    VITE_COGNITO_REDIRECT_SIGNOUT: local
      ? `"http://localhost:5000/"`
      : `"${secrets["applicationEndpointUrl"]}"`,
    VITE_IDM_HOME_URL: `"${
      idmInfo.home_url || "https://test.home.idm.cms.gov"
    }"`,
    VITE_GOOGLE_ANALYTICS_GTAG: `"${googleAnalytics.gtag}"`,
    VITE_GOOGLE_ANALYTICS_DISABLE: `"${googleAnalytics.disable}"`,
    VITE_LAUNCHDARKLY_CLIENT_ID: `"${launchdarklyClientID}"`,
  };

  const envFilePath = path.join(__dirname, "..", "react-app", ".env.local");
  const envFileContent = Object.entries(envVariables)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  await fs.writeFile(envFilePath, envFileContent);

  console.log(`.env.local file written to ${envFilePath}`);
  return envFilePath;
}

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: process.env.REGION_A });

export async function fetchSecret(
  project: string,
  stage: string,
  secretNameSuffix: string,
): Promise<any> {
  const secretName = `${project}/${stage}/${secretNameSuffix}`;

  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const data = await client.send(command);
    console.log(`Using secret at ${secretName}`);
    if (data.SecretString) {
      try {
        return JSON.parse(data.SecretString);
      } catch {
        return data.SecretString; // Return plain text if JSON parsing fails
      }
    } else if (data.SecretBinary) {
      // Handle binary data if necessary
      return data.SecretBinary;
    } else {
      throw new Error(`Secret value not found for ${secretName}`);
    }
  } catch (error: any) {
    // Fallback to default stage
    const defaultSecretName = `${project}/default/${secretNameSuffix}`;

    try {
      const defaultCommand = new GetSecretValueCommand({
        SecretId: defaultSecretName,
      });
      const defaultData = await client.send(defaultCommand);
      console.log(`Using secret at ${defaultSecretName}`);
      if (defaultData.SecretString) {
        try {
          return JSON.parse(defaultData.SecretString);
        } catch {
          return defaultData.SecretString; // Return plain text if JSON parsing fails
        }
      } else if (defaultData.SecretBinary) {
        // Handle binary data if necessary
        return defaultData.SecretBinary;
      } else {
        throw new Error(`Secret value not found for ${defaultSecretName}`);
      }
    } catch (fallbackError: any) {
      throw new Error(
        `Failed to fetch default secret ${defaultSecretName}: ${fallbackError.message}`,
      );
    }
  }
}

const secretsManagerClient = new SecretsManagerClient({
  region: process.env.REGION_A,
});

const fetchDeployOutput = async (stack, stage, key) => {
  const secretName = `cdkExports/${process.env.PROJECT}-${stack}-${stage}/${key}`;
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await secretsManagerClient.send(command);

  const secretString = response.SecretString!;
  return secretString;
  // try {
  //   return JSON.parse(secretString);
  // } catch (e) {
  //   return secretString;
  // }
};

function confirmDestroyCommand(stack) {
  const orange = "\x1b[38;5;208m";
  const reset = "\x1b[0m";

  var confirmation = readlineSync.question(`
${orange}********************************* STOP *******************************
You've requested a destroy for: 

    ${stack}.

Continuing will irreversibly delete all data and infrastructure
associated with ${stack} and its nested stacks.

Do you really want to destroy it?
Re-enter the stack name (${stack}) to continue:
**********************************************************************${reset}
`);

  if (confirmation !== stack) {
    throw new Error(`
${orange}**********************************************************************
The destroy operation has been aborted.
**********************************************************************${reset}
`);
  }
}
