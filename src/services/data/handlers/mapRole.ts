import { Handler } from "aws-lambda";
import * as os from "./../../../libs/opensearch-lib";

export const handler: Handler = async (event, context, callback) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const response = {
    statusCode: 200,
  };
  try {
    if (!event.MasterRoleToAssume) {
      throw "ERROR:  Property MasterRoleToAssume is required, but was not supplied.";
    }
    if (!event.OSRoleName) {
      throw "ERROR:  Property OSRoleName is required, but was not supplied.";
    }
    if (!event.IAMRoleName) {
      throw "ERROR:  Property IAMRoleName is required, but was not supplied.";
    }
    if (!process.env.osDomain) {
      throw "ERROR:  process.env.osDomain must be defined";
    }
    let reply = await os.mapRole(
      process.env.osDomain,
      event.ResourceProperties.MasterRoleToAssume,
      event.ResourceProperties.OSRoleName,
      event.ResourceProperties.IAMRoleName
    );
    console.log(reply);
  } catch (error) {
    console.log(error);
    response.statusCode = 500;
  } finally {
    callback(null, response);
  }
};
