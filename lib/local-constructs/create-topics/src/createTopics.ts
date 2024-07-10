import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import * as topics from "./../../../libs/topics-lib";

interface TopicConfig {
  topic: string;
  numPartitions: number;
  replicationFactor: number;
}

export const handler = async function (
  event: CloudFormationCustomResourceEvent,
  context: Context,
) {
  console.log("Request:", JSON.stringify(event, undefined, 2));
  const resourceProperties = event.ResourceProperties;
  const topicsToCreate: TopicConfig[] = resourceProperties.topicsToCreate;
  const brokerString: string = resourceProperties.brokerString;
  const topicConfig: TopicConfig[] = topicsToCreate.map(function (
    element: TopicConfig,
  ) {
    const topic: string = element.topic;
    const replicationFactor: number = element.replicationFactor || 3;
    const numPartitions: number = element.numPartitions || 1;
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
    };
  });
  console.log(JSON.stringify(topicConfig, null, 2));
  await topics.createTopics(brokerString, topicConfig);
};
