import { CloudFormationCustomResourceEvent } from "aws-lambda";
import * as topics from "../../../libs/topics-lib";

export const handler = async function (
  event: CloudFormationCustomResourceEvent,
): Promise<void> {
  console.log("Request:", JSON.stringify(event, undefined, 2));

  const BrokerString: string = event.ResourceProperties.brokerString;
  const TopicPatternsToDelete: string[] =
    event.ResourceProperties.topicPatternsToDelete;
  const requiredPattern = /^--.*--.*--/; // Regular expression to match the required format

  TopicPatternsToDelete.forEach((pattern) => {
    if (!requiredPattern.test(pattern)) {
      throw `Pattern "${pattern}" does not start with the required format.  Refusing to continue.`;
    }
  });

  console.log(
    `Attempting a delete for each of the following patterns:  ${TopicPatternsToDelete}`,
  );

  const maxRetries = 10;
  const retryDelay = 10000; //10s
  let retries = 0;
  let success = false;
  while (!success && retries < maxRetries) {
    try {
      await topics.deleteTopics(BrokerString, TopicPatternsToDelete);
      success = true;
    } catch (error) {
      console.error(
        `Error in deleteTopics operation: ${JSON.stringify(error)}`,
      );
      retries++;
      console.log(
        `Retrying in ${
          retryDelay / 1000
        } seconds (Retry ${retries}/${maxRetries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
  if (!success) {
    throw `Failed to delete topics after ${maxRetries} retries.`;
  }
};
