import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
type ResponseStatus = typeof SUCCESS | typeof FAILED;
import * as os from "./../../../libs/opensearch-lib";

export const handler: Handler = async (event, context) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const responseData = {};
  let responseStatus: ResponseStatus = SUCCESS;
  try {
    if (event.RequestType == "Create" || event.RequestType == "Update") {
      if (!event.ResourceProperties.MasterRoleToAssume) {
        throw "ERROR:  Property MasterRoleToAssume is required, but was not supplied.";
      }
      if (!event.ResourceProperties.OSRoleName) {
        throw "ERROR:  Property OSRoleName is required, but was not supplied.";
      }
      if (!event.ResourceProperties.IAMRoleName) {
        throw "ERROR:  Property IAMRoleName is required, but was not supplied.";
      }
      if (!process.env.osDomain) {
        throw "ERROR:  process.env.osDomain must be defined";
      }
      await os.mapRole(
        process.env.osDomain,
        event.ResourceProperties.MasterRoleToAssume,
        event.ResourceProperties.OSRoleName,
        event.ResourceProperties.IAMRoleName
      );
    }
  } catch (error) {
    console.log(error);
    responseStatus = FAILED;
  } finally {
    console.log("finally");
    await send(event, context, responseStatus, responseData);
  }
};
