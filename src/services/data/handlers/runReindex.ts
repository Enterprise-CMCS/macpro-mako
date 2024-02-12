import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
type ResponseStatus = typeof SUCCESS | typeof FAILED;

export const handler: Handler = async (event, context) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const responseData = {};
  let responseStatus: ResponseStatus = SUCCESS;
  try {
    if (event.RequestType == "Create" || event.RequestType == "Update") {
      console.log(event.ResourceProperties.StateMachine)
    }
  } catch (error) {
    console.log(error);
    responseStatus = FAILED;
  } finally {
    console.log("finally");
    await send(event, context, responseStatus, responseData);
  }
};
