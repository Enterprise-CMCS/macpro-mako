import { send, SUCCESS, FAILED } from "cfn-response-async";
import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import * as topics from "../libs/topics-lib";
type ResponseStatus = typeof SUCCESS | typeof FAILED;

export const handler = async function (
  event: CloudFormationCustomResourceEvent,
  context: Context
): Promise<void> {
  console.log("Request:", JSON.stringify(event, undefined, 2));
  const responseData: any = {};
  let responseStatus: ResponseStatus = SUCCESS;
  try {
    const BrokerString: string = event.ResourceProperties.BrokerString;
    const TopicPatternsToDelete: string[] =
      event.ResourceProperties.TopicPatternsToDelete;
    if (event.RequestType === "Create" || event.RequestType == "Update") {
      console.log("This resource does nothing on Create and Update events.");
    } else if (event.RequestType === "Delete") {
      console.log(
        `Attempting a delete for each of the following patterns:  ${TopicPatternsToDelete}`
      );
      await topics.deleteTopics(BrokerString, TopicPatternsToDelete);
    }
  } catch (error) {
    console.error(error);
    responseStatus = FAILED;
  } finally {
    await send(event, context, responseStatus, responseData, "static");
  }
};
