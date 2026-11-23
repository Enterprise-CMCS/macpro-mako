import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { Argv } from "yargs";

import { checkIfAuthenticated, project, runCommand, setStageFromBranch } from "../lib";

type E2eOptions = {
  ui?: boolean;
  deployed?: boolean;
  stage?: string;
  shard?: string;
  grep?: string;
  "run-agents"?: string;
  "test-list"?: string;
  "test-list-invert"?: string;
  "repeat-each"?: number;
  retries?: number;
};

function buildPlaywrightArgs(options: E2eOptions): string[] {
  const args: string[] = [];

  if (options.ui) {
    args.push("--ui");
  }
  if (options.shard) {
    args.push(`--shard=${options.shard}`);
  }
  if (options.grep) {
    args.push(`--grep=${options.grep}`);
  }
  if (options["run-agents"]) {
    args.push(`--run-agents=${options["run-agents"]}`);
  }
  if (options["test-list"]) {
    args.push(`--test-list=${options["test-list"]}`);
  }
  if (options["test-list-invert"]) {
    args.push(`--test-list-invert=${options["test-list-invert"]}`);
  }
  if (options["repeat-each"] !== undefined) {
    args.push(`--repeat-each=${options["repeat-each"]}`);
  }
  if (options.retries !== undefined) {
    args.push(`--retries=${options.retries}`);
  }

  return args;
}

async function resolveDeployedBaseUrl(stage: string): Promise<string> {
  const deploymentOutput = JSON.parse(
    (
      await new SSMClient({ region: "us-east-1" }).send(
        new GetParameterCommand({
          Name: `/${project}/${stage}/deployment-output`,
        }),
      )
    ).Parameter!.Value!,
  );

  const baseUrl = deploymentOutput.applicationEndpointUrl as string | undefined;
  if (!baseUrl) {
    throw new Error(`deployment-output for ${project}/${stage} is missing applicationEndpointUrl`);
  }

  return baseUrl;
}

export const e2e = {
  command: "e2e",
  describe:
    "Run Playwright E2E journeys. Defaults to the mocked tier (no AWS). Use --deployed [--stage] against a stage.",
  builder: (yargs: Argv) =>
    yargs
      .option("ui", {
        type: "boolean",
        demandOption: false,
        default: false,
        describe: "Run the tests in the Playwright UI view",
        defaultDescription: "false",
      })
      .option("deployed", {
        type: "boolean",
        demandOption: false,
        default: false,
        describe: "Run against a deployed stage (requires AWS credentials)",
        defaultDescription: "false",
      })
      .option("stage", {
        type: "string",
        demandOption: false,
        describe: "Stage for --deployed (defaults to current branch name)",
        defaultDescription: "current branch name",
      })
      .option("shard", {
        type: "string",
        demandOption: false,
        describe: 'Playwright shard in "current/total" form, e.g. 1/2',
      })
      .option("grep", {
        type: "string",
        demandOption: false,
        describe: "Only run tests matching this regular expression",
      })
      .option("run-agents", {
        type: "string",
        demandOption: false,
        describe: "Override Playwright runAgents (e.g. missing). CI keeps none.",
      })
      .option("test-list", {
        type: "string",
        demandOption: false,
        describe: "Path to a Playwright --test-list file",
      })
      .option("test-list-invert", {
        type: "string",
        demandOption: false,
        describe: "Path to a Playwright --test-list-invert file",
      })
      .option("repeat-each", {
        type: "number",
        demandOption: false,
        describe: "Repeat each test N times (forwarded to Playwright)",
      })
      .option("retries", {
        type: "number",
        demandOption: false,
        describe: "Override Playwright retries",
      }),
  handler: async (options: E2eOptions) => {
    if (options.deployed) {
      await checkIfAuthenticated();
      const stage = options.stage || (await setStageFromBranch());
      const baseUrl = await resolveDeployedBaseUrl(stage);
      process.env.E2E_BASE_URL = baseUrl;
      process.env.E2E_TIER = "deployed";
      process.env.STAGE_NAME = stage;
      console.log(`Running deployed e2e against ${baseUrl} (stage=${stage})`);
    } else {
      process.env.E2E_TIER = "mocked";
      delete process.env.E2E_BASE_URL;
      console.log("Running mocked e2e (no AWS credentials required)");
    }

    await runCommand("bun", ["playwright", "install", "--with-deps", "chromium"], ".");

    const script = options.deployed
      ? options.ui
        ? "e2e:deployed:ui"
        : "e2e:deployed"
      : options.ui
        ? "e2e:ui"
        : "e2e";

    const playwrightArgs = buildPlaywrightArgs({
      ...options,
      // Script already includes --ui when using e2e:ui / e2e:deployed:ui
      ui: false,
    });

    const bunArgs = ["run", script];
    if (playwrightArgs.length > 0) {
      bunArgs.push("--", ...playwrightArgs);
    }

    await runCommand("bun", bunArgs, "test");
  },
};
