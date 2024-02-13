import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";

export const handler:Handler = async (event, _, callback) => {
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  const responseData = {};
  try {
    const cfnEvent = event.Context.Execution.Input?.cfnEvent;
    const cfnContext = event.Context.Execution.Input?.cfnContext;
    if(!cfnEvent){
      console.log("No cfnEvent.  No one to notify.  Will proceed");
    } else {
      console.log("Sending notification to CFN... Success: " + event.Success);
      const result = event.Success ? SUCCESS : FAILED;
      await send(cfnEvent, cfnContext, result, responseData, "static");
    }
  } catch (error: any) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};