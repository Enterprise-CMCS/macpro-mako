import yargs from "yargs";
import * as dotenv from "dotenv";
import LabeledProcessRunner from "./runner.js";
import * as fs from "fs";
import { ServerlessStageDestroyer } from "@stratiformdigital/serverless-stage-destroyer";
import { SechubGithubSync } from "@stratiformdigital/security-hub-sync";
import { ServerlessRunningStages } from "@enterprise-cmcs/macpro-serverless-running-stages";

// load .env
dotenv.config();

const runner = new LabeledProcessRunner();

function touch(file: string) {
  try {
    const time = new Date();
    fs.utimesSync(file, time, time);
  } catch (err) {
    fs.closeSync(fs.openSync(file, "w"));
  }
}

async function frozenInstall(runner: LabeledProcessRunner, dir: string) {
  await runner.run_command_and_output(
    `${dir.split("/").slice(-1)} deps`,
    ["yarn", "install", "--frozen-lockfile"],
    dir
  );
}

async function install_deps(runner: LabeledProcessRunner, dir: string) {
  if (process.env.CI == "true") {
    if (!fs.existsSync(`${dir}/node_modules`)) {
      await frozenInstall(runner, dir);
    }
  } else {
    if (
      !fs.existsSync(`${dir}/.yarn_install`) ||
      fs.statSync(`${dir}/.yarn_install`).ctimeMs <
        fs.statSync(`${dir}/yarn.lock`).ctimeMs
    ) {
      await frozenInstall(runner, dir);
      touch(`${dir}/.yarn_install`);
    }
  }
}

async function install_deps_for_services() {
  var services = getDirectories("src/services");
  for (let service of services) {
    await install_deps(runner, `src/services/${service}`);
  }
  await install_deps(runner, "src/libs");
}

function getDirectories(path: string) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isDirectory();
  });
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
    "deployLocalUi",
    "configure and start a local ui/react against a remote backend",
    {
      stage: { type: "string", demandOption: true },
    },
    async (options) => {
      await install_deps_for_services();
      await runner.run_command_and_output(
        `ui configure`,
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
    "run any available tests for an mmdl stage.",
    {
      stage: { type: "string", demandOption: true },
    },
    async (options) => {
      await install_deps_for_services();
      await refreshOutputs(options.stage);
      console.log(
        `Here, we would run tests for ${options.stage}, but there are no tests yet!`
      );
    }
  )
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
    "deleteTopics",
    "Deletes topics from Bigmac which were created by development/ephemeral branches.",
    {
      stage: { type: "string", demandOption: true },
      // verify: { type: "boolean", demandOption: false, default: true },
    },
    async (options) => {
      await install_deps_for_services();
      await refreshOutputs("master");
      await runner.run_command_and_output(
        `Delete Topics`,
        [
          "sls",
          "topics",
          "invoke",
          "--stage",
          "master",
          "--function",
          "deleteTopics",
          "--data",
          JSON.stringify({
            project: process.env.PROJECT,
            stage: options.stage,
          }),
        ],
        "."
      );
    }
  )
  .command(
    "syncSecurityHubFindings",
    "Syncs Sec Hub findings to GitHub Issues... usually only run by the CI system.",
    {
      auth: { type: "string", demandOption: true },
      repository: { type: "string", demandOption: true },
      accountNickname: { type: "string", demandOption: true },
    },
    async (options) => {
      for (let region of [process.env.REGION_A, process.env.REGION_B]) {
        var sync = new SechubGithubSync({
          repository: options.repository,
          auth: options.auth,
          region: region,
          accountNickname: options.accountNickname,
          severity: ["CRITICAL", "HIGH", "MEDIUM"],
        });
        await sync.sync();
      }
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
  .strict() // This errors and prints help if you pass an unknown command
  .scriptName("run") // This modifies the displayed help menu to show 'run' isntead of 'dev.js'
  .demandCommand(1, "").argv; // this prints out the help if you don't call a subcommand
