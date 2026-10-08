import { pathToFileURL } from "node:url";

import {
  CloudFormationClient,
  DescribeStacksCommand,
  ListExportsCommand,
} from "@aws-sdk/client-cloudformation";
import {
  CreateSecretCommand,
  GetSecretValueCommand,
  PutSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import { fromIni } from "@aws-sdk/credential-providers";

const DEFAULT_PROJECT = "mako";
const DEFAULT_REGION = "us-east-1";
const BIGMAC_PROJECT = "bigmac";

type IntegrationPair = "main" | "val" | "production";

interface ScriptOptions {
  pair: IntegrationPair | "all";
  project: string;
  region: string;
  onemacProfile?: string;
  bigmacProfile?: string;
  dryRun: boolean;
  ensureProducerSecret: boolean;
}

interface IntegrationPairConfig {
  bigmacStage: string;
  onemacSecretNames: string[];
}

const INTEGRATION_PAIRS: Record<IntegrationPair, IntegrationPairConfig> = {
  main: {
    bigmacStage: "master",
    onemacSecretNames: ["mako-default"],
  },
  val: {
    bigmacStage: "val",
    onemacSecretNames: ["mako-val"],
  },
  production: {
    bigmacStage: "production",
    onemacSecretNames: ["mako-production"],
  },
};

interface BigmacQueueOutputs {
  queueUrl: string;
  queueArn: string;
}

export function mergeProducerAccounts(
  existingAccounts: Record<string, unknown>,
  onemacAccountId: string,
): Record<string, unknown> {
  return {
    ...existingAccounts,
    onemac: onemacAccountId,
  };
}

function parseArgs(argv: string[]): ScriptOptions {
  let pair: ScriptOptions["pair"] = "all";
  let project = DEFAULT_PROJECT;
  let region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || DEFAULT_REGION;
  let onemacProfile: string | undefined;
  let bigmacProfile: string | undefined;
  let dryRun = false;
  let ensureProducerSecret = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--pair":
        pair = (argv[index + 1] || pair) as ScriptOptions["pair"];
        index += 1;
        break;
      case "--project":
        project = argv[index + 1] || project;
        index += 1;
        break;
      case "--region":
        region = argv[index + 1] || region;
        index += 1;
        break;
      case "--onemac-profile":
        onemacProfile = argv[index + 1];
        index += 1;
        break;
      case "--bigmac-profile":
        bigmacProfile = argv[index + 1];
        index += 1;
        break;
      case "--dry-run":
        dryRun = true;
        break;
      case "--ensure-producer-secret":
        ensureProducerSecret = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!["main", "val", "production", "all"].includes(pair)) {
    throw new Error(`Invalid --pair value: ${pair}`);
  }

  return {
    pair,
    project,
    region,
    onemacProfile,
    bigmacProfile,
    dryRun,
    ensureProducerSecret,
  };
}

function createClient<T extends { new (config: object): InstanceType<T> }>(
  Client: T,
  region: string,
  profile?: string,
): InstanceType<T> {
  return new Client({
    region,
    ...(profile ? { credentials: fromIni({ profile }) } : {}),
  });
}

function assertPrimaryQueueOutputs(outputs: BigmacQueueOutputs, bigmacStage: string): void {
  if (outputs.queueUrl.toLowerCase().includes("dlq")) {
    throw new Error(`Refusing DLQ queue URL for BigMAC stage ${bigmacStage}: ${outputs.queueUrl}`);
  }

  if (outputs.queueArn.toLowerCase().includes("dlq")) {
    throw new Error(`Refusing DLQ queue ARN for BigMAC stage ${bigmacStage}: ${outputs.queueArn}`);
  }

  const expectedQueueName = `${BIGMAC_PROJECT}-${bigmacStage}-queue`;
  if (!outputs.queueUrl.endsWith(`/${expectedQueueName}`)) {
    throw new Error(
      `Unexpected queue URL for BigMAC stage ${bigmacStage}. Expected suffix /${expectedQueueName}, got ${outputs.queueUrl}`,
    );
  }

  if (!outputs.queueArn.endsWith(`:${expectedQueueName}`)) {
    throw new Error(
      `Unexpected queue ARN for BigMAC stage ${bigmacStage}. Expected suffix :${expectedQueueName}, got ${outputs.queueArn}`,
    );
  }
}

async function readBigmacQueueOutputs(
  client: CloudFormationClient,
  bigmacStage: string,
): Promise<BigmacQueueOutputs> {
  const stackName = `${BIGMAC_PROJECT}-sqs-${bigmacStage}`;
  const stackResponse = await client.send(new DescribeStacksCommand({ StackName: stackName }));
  const outputs = stackResponse.Stacks?.[0]?.Outputs ?? [];
  const queueUrl = outputs.find((output) => output.OutputKey === "MainQueueUrl")?.OutputValue;
  const queueArn = outputs.find((output) => output.OutputKey === "MainQueueArn")?.OutputValue;

  if (queueUrl && queueArn) {
    return { queueUrl, queueArn };
  }

  const exportUrlName = `${BIGMAC_PROJECT}-${bigmacStage}-queue-url`;
  const exportArnName = `${BIGMAC_PROJECT}-${bigmacStage}-queue-arn`;
  const exportsResponse = await client.send(new ListExportsCommand({}));
  const exports = exportsResponse.Exports ?? [];
  const exportedUrl = exports.find((item) => item.Name === exportUrlName)?.Value;
  const exportedArn = exports.find((item) => item.Name === exportArnName)?.Value;

  if (!exportedUrl || !exportedArn) {
    throw new Error(
      `Unable to resolve BigMAC queue outputs for stage ${bigmacStage}. Checked stack ${stackName} and exports ${exportUrlName}/${exportArnName}.`,
    );
  }

  return { queueUrl: exportedUrl, queueArn: exportedArn };
}

function isResourceNotFoundError(error: unknown): boolean {
  return (
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "ResourceNotFoundException") ||
    (error instanceof Error && error.message.includes("ResourceNotFoundException"))
  );
}

async function readSecretJson(
  client: SecretsManagerClient,
  secretName: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
    if (!response.SecretString) {
      throw new Error(`Secret ${secretName} has no SecretString value`);
    }

    const parsed = JSON.parse(response.SecretString) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error(`Secret ${secretName} must contain a JSON object`);
    }

    return parsed as Record<string, unknown>;
  } catch (error) {
    if (isResourceNotFoundError(error)) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read secret ${secretName}: ${message}`);
  }
}

async function writeSecretJson(
  client: SecretsManagerClient,
  secretName: string,
  secretValue: Record<string, unknown>,
  dryRun: boolean,
): Promise<void> {
  const payload = JSON.stringify(secretValue, null, 2);

  if (dryRun) {
    console.log(`[dry-run] Would update secret ${secretName} with:`);
    console.log(
      JSON.stringify(
        {
          bigmacErrorQueueUrl: secretValue.bigmacErrorQueueUrl,
          bigmacErrorQueueArn: secretValue.bigmacErrorQueueArn,
        },
        null,
        2,
      ),
    );
    return;
  }

  try {
    await client.send(
      new PutSecretValueCommand({
        SecretId: secretName,
        SecretString: payload,
      }),
    );
  } catch (error) {
    if (!isResourceNotFoundError(error)) {
      throw error;
    }

    await client.send(
      new CreateSecretCommand({
        Name: secretName,
        SecretString: payload,
      }),
    );
  }
}

async function ensureBigmacProducerSecret(
  bigmacSecretsClient: SecretsManagerClient,
  onemacStsClient: STSClient,
  bigmacStage: string,
  dryRun: boolean,
): Promise<void> {
  const secretId = `${BIGMAC_PROJECT}/${bigmacStage}/sqsProducerAccounts`;
  const identity = await onemacStsClient.send(new GetCallerIdentityCommand({}));
  const onemacAccountId = identity.Account;

  if (!onemacAccountId || !/^\d{12}$/.test(onemacAccountId)) {
    throw new Error("Unable to resolve a 12-digit OneMAC account id from STS");
  }

  let existingAccounts: Record<string, unknown> = {};
  try {
    existingAccounts = await readSecretJson(bigmacSecretsClient, secretId);
  } catch (error) {
    if (!isResourceNotFoundError(error)) {
      throw error;
    }
  }

  const mergedAccounts = mergeProducerAccounts(existingAccounts, onemacAccountId);
  const secretPayload = JSON.stringify(mergedAccounts, null, 2);

  if (dryRun) {
    console.log(
      `[dry-run] Would merge onemac account ${onemacAccountId} into BigMAC secret ${secretId} while preserving ${Object.keys(existingAccounts).length} existing entries.`,
    );
    return;
  }

  try {
    await bigmacSecretsClient.send(
      new PutSecretValueCommand({
        SecretId: secretId,
        SecretString: secretPayload,
      }),
    );
  } catch (error) {
    if (!isResourceNotFoundError(error)) {
      throw error;
    }

    await bigmacSecretsClient.send(
      new CreateSecretCommand({
        Name: secretId,
        SecretString: secretPayload,
      }),
    );
  }

  console.log(`Updated BigMAC producer secret ${secretId} with onemac account ${onemacAccountId}`);
}

async function bootstrapPair(
  options: ScriptOptions,
  pair: IntegrationPair,
): Promise<Record<string, unknown>> {
  const config = INTEGRATION_PAIRS[pair];
  const bigmacCfnClient = createClient(CloudFormationClient, options.region, options.bigmacProfile);
  const onemacSecretsClient = createClient(
    SecretsManagerClient,
    options.region,
    options.onemacProfile,
  );
  const bigmacSecretsClient = createClient(
    SecretsManagerClient,
    options.region,
    options.bigmacProfile,
  );
  const onemacStsClient = createClient(STSClient, options.region, options.onemacProfile);

  const queueOutputs = await readBigmacQueueOutputs(bigmacCfnClient, config.bigmacStage);
  assertPrimaryQueueOutputs(queueOutputs, config.bigmacStage);

  if (options.ensureProducerSecret) {
    await ensureBigmacProducerSecret(
      bigmacSecretsClient,
      onemacStsClient,
      config.bigmacStage,
      options.dryRun,
    );
  }

  const updates: Array<Record<string, unknown>> = [];

  for (const secretName of config.onemacSecretNames) {
    const resolvedSecretName = secretName.replace(/^mako-/, `${options.project}-`);
    const existingSecret = await readSecretJson(onemacSecretsClient, resolvedSecretName);
    const mergedSecret = {
      ...existingSecret,
      bigmacErrorQueueUrl: queueOutputs.queueUrl,
      bigmacErrorQueueArn: queueOutputs.queueArn,
    };

    await writeSecretJson(onemacSecretsClient, resolvedSecretName, mergedSecret, options.dryRun);
    updates.push({
      secretName: resolvedSecretName,
      bigmacErrorQueueUrl: queueOutputs.queueUrl,
      bigmacErrorQueueArn: queueOutputs.queueArn,
    });
  }

  return {
    pair,
    bigmacStage: config.bigmacStage,
    queueUrl: queueOutputs.queueUrl,
    queueArn: queueOutputs.queueArn,
    updatedSecrets: updates,
    ensureProducerSecret: options.ensureProducerSecret,
    dryRun: options.dryRun,
  };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const pairs: IntegrationPair[] =
    options.pair === "all" ? ["main", "val", "production"] : [options.pair];

  const results = [];
  for (const pair of pairs) {
    results.push(await bootstrapPair(options, pair));
  }

  console.log(JSON.stringify({ results }, null, 2));
  console.log(
    "Redeploy OneMAC after updating secrets so CDK re-synths sinkSmart with BIGMAC_ERROR_QUEUE_URL.",
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
