import { Argv } from "yargs";
import {
  checkIfAuthenticated,
  LabeledProcessRunner,
  project,
  region,
  setStageFromBranch,
} from "../lib/";
import {
  ResourceGroupsTaggingAPIClient,
  GetResourcesCommand,
  TagFilter,
} from "@aws-sdk/client-resource-groups-tagging-api";
import {
  LambdaClient,
  GetFunctionCommand,
  GetFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";
import prompts from "prompts";

const lambdaClient = new LambdaClient({ region });

const runner = new LabeledProcessRunner();

export const logs = {
  command: "logs",
  describe: "Stream a lambda's cloudwatch logs.",
  builder: (yargs: Argv) =>
    yargs
      .option("stage", { type: "string", demandOption: false })
      .option("functionName", {
        alias: "f",
        type: "string",
        demandOption: true,
      }),
  handler: async (options: { stage?: string; functionName: string }) => {
    await checkIfAuthenticated();
    const stage = options.stage || (await setStageFromBranch());
    const { functionName } = options;

    // Find all lambdas for the project and stage
    const lambdas = await getLambdasWithTags([
      {
        Key: "PROJECT",
        Value: project,
      },
      {
        Key: "STAGE",
        Value: stage,
      },
    ]);

    // Filter out any lambdas that dont contain the functionName string
    const filteredLambdas = lambdas.filter((lambda) =>
      lambda.toLowerCase().includes(functionName.toLowerCase()),
    );

    // Set the target lambda, asking the user if necessary
    let lambda: string;
    if (filteredLambdas.length > 1) {
      const response = await prompts({
        type: "select",
        name: "selectedLambda",
        message: "Which Lambda function's logs do you want to stream?",
        choices: filteredLambdas.map((lambda) => ({
          title: lambda,
          value: lambda,
        })),
      });
      lambda = response.selectedLambda;
    } else if (filteredLambdas.length === 1) {
      lambda = filteredLambdas[0];
    } else {
      console.error("No Lambda functions found with the specified tags.");
      return;
    }

    // Find the lambda log group name by checking the lambda's config
    const lambdaLogGroup = await getLambdaLogGroup(lambda);

    // Stream the logs
    await runner.run_command_and_output(
      "stream awslogs",
      ["awslogs", "get", lambdaLogGroup, "-s5h", "--watch"],
      ".",
    );
  },
};

interface Tag {
  Key: string;
  Value: string;
}

async function getLambdasWithTags(tags: Tag[]): Promise<string[]> {
  const taggingClient = new ResourceGroupsTaggingAPIClient({
    region,
  });

  // Ensure tags are valid
  const tagFilters: TagFilter[] = tags
    .filter((tag): tag is Tag => !!tag.Key && !!tag.Value) // Ensure no undefined keys or values
    .map((tag) => ({
      Key: tag.Key,
      Values: [tag.Value],
    }));

  const command = new GetResourcesCommand({
    ResourceTypeFilters: ["lambda"],
    TagFilters: tagFilters,
  });

  try {
    const data = await taggingClient.send(command);
    if (!data.ResourceTagMappingList) {
      return [];
    }

    // Extract Lambda function ARNs from the response
    const lambdaArns = data.ResourceTagMappingList.map(
      (resource) => resource.ResourceARN!,
    );

    // Fetch Lambda function names from their ARNs
    const lambdaNames = await Promise.all(
      lambdaArns.map(async (arn) => {
        const functionCommand = new GetFunctionCommand({ FunctionName: arn });
        const functionData = await lambdaClient.send(functionCommand);
        return functionData.Configuration?.FunctionName || "";
      }),
    );

    return lambdaNames;
  } catch (error) {
    console.error("Error retrieving Lambda functions with tags:", error);
    return [];
  }
}

async function getLambdaLogGroup(functionName: string) {
  const response = await lambdaClient.send(
    new GetFunctionConfigurationCommand({
      FunctionName: functionName,
    }),
  );
  if (response?.LoggingConfig?.LogGroup) {
    return response.LoggingConfig.LogGroup;
  } else {
    throw new Error("Error finding log group for function " + functionName);
  }
}
