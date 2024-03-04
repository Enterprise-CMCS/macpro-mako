import { Handler } from "aws-lambda";
import * as os from "./../../../libs/opensearch-lib";

export const handler: Handler = async (event, _, callback) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    const reply = await os.mapRole(
      process.env.osDomain!,
      process.env.masterRoleToAssume!,
      process.env.osRoleName!,
      process.env.iamRoleName!
    );
    console.log(reply);
  } catch (error: any) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};
