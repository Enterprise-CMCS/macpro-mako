import { CloudFormationCustomResourceEvent } from "aws-lambda";

import * as topics from "./../../../libs/topics-lib";

interface TopicConfigEntry {
  name: string;
  value: string;
}

interface TopicConfigInput {
  topic: string;
  numPartitions?: number;
  replicationFactor?: number;
  configEntries?: TopicConfigEntry[];
}

interface TopicConfig {
  topic: string;
  numPartitions: number;
  replicationFactor: number;
  configEntries?: TopicConfigEntry[];
}

function readConfigEntries(value: unknown): TopicConfigEntry[] | undefined {
  if (value == null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw "Invalid configuration for topicsToCreate.  configEntries must be an array.";
  }

  return value.map((entry: unknown) => {
    if (
      entry === null ||
      typeof entry !== "object" ||
      typeof (entry as { name?: unknown }).name !== "string" ||
      typeof (entry as { value?: unknown }).value !== "string" ||
      (entry as { name: string }).name.length === 0
    ) {
      throw "Invalid configuration for topicsToCreate.  Each configEntries item must have string name and value.";
    }

    return {
      name: (entry as { name: string }).name,
      value: (entry as { value: string }).value,
    };
  });
}

export const handler = async function (event: CloudFormationCustomResourceEvent) {
  console.log("Request:", JSON.stringify(event, undefined, 2));
  const resourceProperties = event.ResourceProperties;
  const topicsToCreate: TopicConfigInput[] = resourceProperties.topicsToCreate;
  const brokerString: string = resourceProperties.brokerString;
  const topicConfig: TopicConfig[] = topicsToCreate.map(function (element: TopicConfigInput) {
    const topic: string = element.topic;
    const replicationFactor: number = element.replicationFactor || 3;
    const numPartitions: number = element.numPartitions ?? 1;
    const configEntries = readConfigEntries(element.configEntries);
    if (!topic) {
      throw "Invalid configuration for topicsToCreate.  All entries must have a 'name' key with a string value.";
    }
    if (replicationFactor < 3) {
      throw "Invalid configuration for topicsToCreate.  If specified, replicationFactor must be greater than or equal to 3.";
    }
    if (numPartitions < 1) {
      throw "Invalid configuration for topicsToCreate.  If specified, numPartitions must be greater than or equal to 1.";
    }
    return {
      topic,
      numPartitions,
      replicationFactor,
      ...(configEntries ? { configEntries } : {}),
    };
  });
  console.log(JSON.stringify(topicConfig, null, 2));
  await topics.createTopics(brokerString, topicConfig);
};
