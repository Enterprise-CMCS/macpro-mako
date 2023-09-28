import { send, SUCCESS, FAILED } from "cfn-response-async";
import * as topics from "../libs/topics-lib.js";

exports.handler = async function (event, context) {
  console.log("Request:", JSON.stringify(event, undefined, 2));
  const responseData = {};
  let responseStatus = SUCCESS;
  try {
    const BrokerString = event.ResourceProperties.BrokerString;
    const TopicPatternsToDelete =
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
