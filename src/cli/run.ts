import yargs from "yargs";
import * as dotenv from "dotenv";
import LabeledProcessRunner from "./runner.js";
import { ServerlessStageDestroyer } from "@stratiformdigital/serverless-stage-destroyer";
import { ServerlessRunningStages } from "@enterprise-cmcs/macpro-serverless-running-stages";
import { SecurityHubJiraSync } from "@enterprise-cmcs/macpro-security-hub-sync";

// load .env
dotenv.config();

const runner = new LabeledProcessRunner();

async function install_deps(runner: LabeledProcessRunner) {
  await runner.run_command_and_output(
    `Installing Dependencies`,
    ["yarn"],
    ".",
    true
  );
}

async function install_deps_for_services() {
  await install_deps(runner);
}

async function refreshOutputs(stage: string) {
  await runner.run_command_and_output(
    `SLS Refresh Outputs`,
    ["sls", "refresh-outputs", "--stage", stage],
    ".",
    true
  );
}

yargs(process.argv.slice(2))
  .command("install", "install all service dependencies", {}, async () => {
    await install_deps_for_services();
  })
  .command(
    "ui",
    "configure and start a local react ui against a remote backend",
    {
      stage: { type: "string", demandOption: true },
    },
    async (options) => {
      await install_deps_for_services();
      await runner.run_command_and_output(
        `ui config`,
        ["sls", "deploy", "--stage", options.stage],
        "."
      );
      await runner.run_command_and_output(
        `ui start`,
        ["yarn", "dev"],
        `src/services/ui`
      );
    }
  )
  .command(
    "deploy",
    "deploy the project",
    {
      stage: { type: "string", demandOption: true },
      service: { type: "string", demandOption: false },
    },
    async (options) => {
      await install_deps_for_services();
      var deployCmd = ["sls", "deploy", "--stage", options.stage];
      if (options.service) {
        await refreshOutputs(options.stage);
        deployCmd = [
          "sls",
          options.service,
          "deploy",
          "--stage",
          options.stage,
        ];
      }
      await runner.run_command_and_output(`SLS Deploy`, deployCmd, ".");
    }
  )
  .command(
    "test",
    "run all available tests.",
    {
      stage: { type: "string", demandOption: true },
    },
    async (options) => {
      await install_deps_for_services();
      await runner.run_command_and_output(`Unit Tests`, ["yarn", "test"], ".");
      await runner.run_command_and_output(
        `Load test data`,
        ["sls", "database", "seed", "--stage", options.stage],
        "."
      );
    }
  )
  .command("test-gui", "open unit-testing gui for vitest.", {}, async () => {
    await install_deps_for_services();
    await runner.run_command_and_output(
      `Unit Tests`,
      ["yarn", "test-gui"],
      "."
    );
  })
  .command(
    "destroy",
    "destroy a stage in AWS",
    {
      stage: { type: "string", demandOption: true },
      service: { type: "string", demandOption: false },
      wait: { type: "boolean", demandOption: false, default: true },
      verify: { type: "boolean", demandOption: false, default: true },
    },
    async (options) => {
      let destroyer = new ServerlessStageDestroyer();
      let filters = [
        {
          Key: "PROJECT",
          Value: `${process.env.PROJECT}`,
        },
      ];
      if (options.service) {
        filters.push({
          Key: "SERVICE",
          Value: `${options.service}`,
        });
      }
      await destroyer.destroy(`${process.env.REGION_A}`, options.stage, {
        wait: options.wait,
        filters: filters,
        verify: options.verify,
      });
    }
  )
  .command(
    "connect",
    "Prints a connection string that can be run to 'ssh' directly onto the ECS Fargate task",
    {
      stage: { type: "string", demandOption: true },
      service: { type: "string", demandOption: true },
    },
    async (options) => {
      await install_deps_for_services();
      await refreshOutputs(options.stage);
      await runner.run_command_and_output(
        `SLS connect`,
        ["sls", options.service, "connect", "--stage", options.stage],
        "."
      );
    }
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
        "docs"
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
          "docs"
        );
      }
    }
  )
  .command(
    "base-update",
    "this will update your code to the latest version of the base template",
    {},
    async () => {
      const addRemoteCommand = [
        "git",
        "remote",
        "add",
        "base",
        "https://github.com/Enterprise-CMCS/macpro-base-template",
      ];

      await runner.run_command_and_output(
        "Update from Base | adding remote",
        addRemoteCommand,
        ".",
        true,
        {
          stderr: true,
          close: true,
        }
      );

      const fetchBaseCommand = ["git", "fetch", "base"];

      await runner.run_command_and_output(
        "Update from Base | fetching base template",
        fetchBaseCommand,
        "."
      );

      const mergeCommand = ["git", "merge", "base/production", "--no-ff"];

      await runner.run_command_and_output(
        "Update from Base | merging code from base template",
        mergeCommand,
        ".",
        true
      );

      console.log(
        "Merge command was performed. You may have conflicts. This is normal behaivor. To complete the update process fix any conflicts, commit, push, and open a PR."
      );
    }
  )
  .command(
    ["listRunningStages", "runningEnvs", "listRunningEnvs"],
    "Reports on running environments in your currently connected AWS account.",
    {},
    async () => {
      await install_deps_for_services();
      for (const region of [process.env.REGION_A]) {
        const runningStages =
          await ServerlessRunningStages.getAllStagesForRegion(region!);
        console.log(`runningStages=${runningStages.join(",")}`);
      }
    }
  )
  .command(
    ["securityHubJiraSync", "securityHubSync", "secHubSync"],
    "Create Jira Issues for Security Hub findings.",
    {},
    async () => {
      await install_deps_for_services();
      await new SecurityHubJiraSync({
        customJiraFields: {
          customfield_14117: [{ value: "Platform Team" }],
          customfield_14151: [{ value: "Not Applicable " }],
          customfield_14068:
            "* All findings of this type are resolved or suppressed, indicated by a Workflow Status of Resolved or Suppressed.  (Note:  this ticket will automatically close when the AC is met.)",
        },
      }).sync();
    }
  )
  .strict() // This errors and prints help if you pass an unknown command
  .scriptName("run") // This modifies the displayed help menu to show 'run' isntead of 'dev.js'
  .demandCommand(1, "").argv; // this prints out the help if you don't call a subcommand
