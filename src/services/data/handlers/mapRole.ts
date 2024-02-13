import { Handler } from "aws-lambda";
import * as os from "./../../../libs/opensearch-lib";

export const handler: Handler = async (event, _, callback) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    const requiredEnvVars = ["osDomain", "masterRoleToAssume", "osRoleName", "iamRoleName"];

    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        throw `ERROR: process.env.${envVar} is required, but was not supplied.`;
      }
    });
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
