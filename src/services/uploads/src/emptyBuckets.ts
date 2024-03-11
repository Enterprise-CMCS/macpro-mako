import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
type ResponseStatus = typeof SUCCESS | typeof FAILED;

export const handler: Handler = async (event, context) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  console.log("Request:", JSON.stringify(event, undefined, 2));
  const responseData: any = {};
  let responseStatus: ResponseStatus = SUCCESS;
  try {
      console.log("This resource does nothing, and will soon be removed.");
  } catch (error) {
    console.error(error);
    responseStatus = FAILED;
  } finally {
    await send(event, context, responseStatus, responseData, "static");
  }
};
