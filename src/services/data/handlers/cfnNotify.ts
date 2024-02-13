import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
type ResponseStatus = typeof SUCCESS | typeof FAILED;

export const handler:Handler = async (event, context, callback) => {
  const response = {
    statusCode: 200,
  };
  const responseData = {};
  try {
    let cfnEvent = event.Context.Execution.Input?.cfnEvent;
    let cfnContext = event.Context.Execution.Input?.cfnContext;
    if(!cfnEvent){
      console.log("No cfnEvent.  No one to notify.  Will proceed")
    } else {
      console.log("Sending notification to CFN... Success: " + event.Success)
      const result = event.Success ? SUCCESS : FAILED
      await send(cfnEvent, cfnContext, result, responseData, "static");
    }
  } catch (error: any) {
    response.statusCode = 500;
    callback(error, response);
  } finally {
    callback(null, response);
  }
};