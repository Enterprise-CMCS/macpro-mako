import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
type ResponseStatus = typeof SUCCESS | typeof FAILED;
import * as os from "./../libs/opensearch-lib";

export const handler: Handler = async (event, context, callback) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const responseData: any = {};
  let responseStatus: ResponseStatus = SUCCESS;
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    if (event.RequestType == "Create" || event.RequestType == "Update") {
      const reply = await os.mapRole(
        event.ResourceProperties.OsDomain,
        event.ResourceProperties.MasterRoleToAssume,
        event.ResourceProperties.OsRoleName,
        event.ResourceProperties.IamRoleName,
      );
      console.log(reply);
    } else if (event.RequestType == "Delete") {
      console.log("This resource does nothing on delete");
    }
  } catch (error) {
    console.log(error);
    responseStatus = FAILED;
    response.statusCode = 500;
    errorResponse = error;
  }

  try {
    await send(event, context, responseStatus, responseData, "static");
  } catch (error) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};
