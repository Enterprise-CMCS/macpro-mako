import {
  CloudFormationClient,
  DeleteStackCommand,
  waitUntilStackDeleteComplete,
} from "@aws-sdk/client-cloudformation";
import {
  DeleteSecurityGroupCommand,
  DescribeSecurityGroupsCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { Argv } from "yargs";

import { checkIfAuthenticated, confirmDestroyCommand, project, region } from "../lib";

const waitForStackDeleteComplete = async (client: CloudFormationClient, stackName: string) => {
  return waitUntilStackDeleteComplete({ client, maxWaitTime: 3600 }, { StackName: stackName });
};

export const destroy = {
  command: "destroy",
  describe:
    "Delete the project stack from the Stage environment in AWS. Will also delete the associated security group if waiting for deletion to complete. \n\n** Requires MACPro Application Admin AWS credentials **\n",
  builder: (yargs: Argv) =>
    yargs
      .option("stage", {
        type: "string",
        demandOption: true,
        describe: "Stage environment in AWS",
      })
      .option("wait", {
        type: "boolean",
        demandOption: false,
        default: true,
        describe: "Whether to wait for the deletion to complete before exiting",
        defaultDescription: "true",
      })
      .option("secgroup", {
        type: "boolean",
        demandOption: false,
        default: true,
        describe: "Whether to delete the security group after deleting the stack",
        defaultDescription: "true",
      })
      .option("verify", {
        type: "boolean",
        demandOption: false,
        default: true,
        describe: "Whether to use interactive confirmation before deleting",
        defaultDescription: "true",
      })
      .check((argv) => {
        if (argv.secgroup === true && argv.wait === false) {
          throw new Error(
            "You cannot delete the security group if not waiting for stack deletion to finish.",
          );
        }
        return true;
      }),
  handler: async ({
    stage,
    wait,
    verify,
    secgroup,
  }: {
    stage: string;
    wait: boolean;
    verify: boolean;
    secgroup: boolean;
  }) => {
    await checkIfAuthenticated();

    const stackName = `${project}-${stage}`;

    if (/prod/i.test(stage)) {
      console.log("Error: Destruction of production stages is not allowed.");
      process.exit(1);
    }

    if (verify) await confirmDestroyCommand(stackName);

    const client = new CloudFormationClient({ region });
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
      if (secgroup) await deleteSecurityGroup(project, stage);
    } else {
      console.log(
        `Stack ${stackName} delete initiated. Not waiting for completion as --wait is set to false.`,
      );
    }
  },
};

/**
 * Fetches the Security Group and deletes it.
 *
 * @param project The project name.
 * @param stage The stage name.
 * @returns {Promise<void>}.
 * @throws {Error} - If there is any issue fetching or deleting the security group.
 */
async function deleteSecurityGroup(project: string, stage: string) {
  const client = new EC2Client({});
  const describeCommand = new DescribeSecurityGroupsCommand({
    Filters: [
      {
        Name: "tag:PROJECT",
        Values: [project],
      },
      {
        Name: "tag:STAGE",
        Values: [stage],
      },
    ],
  });

  try {
    const response = await client.send(describeCommand);
    if (!response?.SecurityGroups?.length) {
      console.log(`No Security Group found for ${stage}, skipping deleting Security Group.`);
      return;
    }

    if (response?.SecurityGroups?.length > 1) {
      console.log(`Multiple Security Groups found for ${stage}, please delete manually.`);
      return;
    }

    if (response?.SecurityGroups?.length === 1 && response?.SecurityGroups?.[0].GroupId) {
      const groupId = response?.SecurityGroups?.[0].GroupId;

      const deleteCommand = new DeleteSecurityGroupCommand({
        GroupId: groupId,
      });

      try {
        console.log(`Security Group ${groupId} delete initiated`);
        const result = await client.send(deleteCommand);
        console.log(
          result
            ? `Security Group ${groupId} deleted successfully.`
            : `Error: Security Group ${groupId} deletion failed.`,
        );

        return;
      } catch (error) {
        console.warn("Error deleting the Security Group", error);
        process.exit(1);
      }
    }

    return;
  } catch (error) {
    console.warn("Error fetching the Security Group", error);
    process.exit(1);
  }
}
