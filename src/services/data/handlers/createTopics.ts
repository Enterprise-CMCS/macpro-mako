import { send, SUCCESS, FAILED } from "cfn-response-async";
import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import * as topics from "../libs/topics-lib";
type ResponseStatus = typeof SUCCESS | typeof FAILED;

interface TopicConfig {
  topic: string;
  numPartitions: number;
  replicationFactor: number;
}

interface ResourceProperties {
  TopicsToCreate: TopicConfig[];
  BrokerString: string;
}

export const handler = async function (
  event: CloudFormationCustomResourceEvent,
  context: Context
) {
  console.log("Request:", JSON.stringify(event, undefined, 2));
  const responseData: any = {};
  let responseStatus: ResponseStatus = SUCCESS;
  try {
    const resourceProperties: ResourceProperties = event.ResourceProperties;
    const TopicsToCreate: TopicConfig[] = resourceProperties.TopicsToCreate;
    const BrokerString: string = resourceProperties.BrokerString;
    const topicConfig: TopicConfig[] = TopicsToCreate.map(function (
      element: TopicConfig
    ) {
      const topic: string = element.topic;
      const replicationFactor: number = element.replicationFactor || 3;
      const numPartitions: number = element.numPartitions || 1;
      if (!topic) {
        throw "Invalid configuration for TopicsToCreate.  All entries must have a 'name' key with a string value.";
      }
      if (replicationFactor < 3) {
        throw "Invalid configuration for TopicsToCreate.  If specified, replicationFactor must be greater than or equal to 3.";
      }
      if (numPartitions < 1) {
        throw "Invalid configuration for TopicsToCreate.  If specified, numPartitions must be greater than or equal to 1.";
      }
      return {
        topic,
        numPartitions,
        replicationFactor,
      };
    });
    console.log(JSON.stringify(topicConfig, null, 2));
    if (event.RequestType === "Create" || event.RequestType == "Update") {
      await topics.createTopics(BrokerString, topicConfig);
    } else if (event.RequestType === "Delete") {
      console.log("This resource does nothing on Delete events.");
    }
  } catch (error) {
    console.error(error);
    responseStatus = FAILED;
  } finally {
    await send(event, context, responseStatus, responseData, "static");
  }
};
