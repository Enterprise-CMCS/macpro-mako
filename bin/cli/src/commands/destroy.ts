import { Argv } from "yargs";
import {
  CloudFormationClient,
  DeleteStackCommand,
  waitUntilStackDeleteComplete,
} from "@aws-sdk/client-cloudformation";
import { checkIfAuthenticated, confirmDestroyCommand } from "../lib";

const waitForStackDeleteComplete = async (
  client: CloudFormationClient,
  stackName: string,
) => {
  return waitUntilStackDeleteComplete(
    { client, maxWaitTime: 3600 },
    { StackName: stackName },
  );
};

export const destroy = {
  command: "destroy",
  describe: "destroy a stage in AWS",
  builder: (yargs: Argv) =>
    yargs
      .option("stage", { type: "string", demandOption: true })
      .option("wait", { type: "boolean", demandOption: false, default: true })
      .option("verify", {
        type: "boolean",
        demandOption: false,
        default: true,
      }),
  handler: async ({
    stage,
    wait,
    verify,
  }: {
    stage: string;
    wait: boolean;
    verify: boolean;
  }) => {
    await checkIfAuthenticated();

    const stackName = `${process.env.PROJECT}-${stage}`;

    if (/prod/i.test(stage)) {
      console.log("Error: Destruction of production stages is not allowed.");
      process.exit(1);
    }

    if (verify) await confirmDestroyCommand(stackName);

    const client = new CloudFormationClient({ region: process.env.REGION_A });
    await client.send(new DeleteStackCommand({ StackName: stackName }));
    console.log(`Stack ${stackName} delete initiated.`);

    if (wait) {
      console.log(`Waiting for stack ${stackName} to be deleted...`);
      const result = await waitForStackDeleteComplete(client, stackName);
      console.log(
        result.state === "SUCCESS"
          ? `Stack ${stackName} deleted successfully.`
          : `Error: Stack ${stackName} deletion failed.`,
      );
    } else {
      console.log(
        `Stack ${stackName} delete initiated. Not waiting for completion as --wait is set to false.`,
      );
    }
  },
};
