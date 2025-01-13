import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
type ResponseStatus = typeof SUCCESS | typeof FAILED;
import * as cognitolib from "./cognito-lib";
import { getSecret } from "shared-utils";

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
      const { userPoolId, users, passwordSecretArn } = event.ResourceProperties;
      const devUserPassword = await getSecret(passwordSecretArn);

      for (let i = 0; i < users.length; i++) {
        console.log(users[i]);
        const poolData = {
          UserPoolId: userPoolId,
          Username: users[i].username,
          UserAttributes: users[i].attributes,
          MessageAction: "SUPPRESS",
        };
        const passwordData = {
          Password: devUserPassword,
          UserPoolId: userPoolId,
          Username: users[i].username,
          Permanent: true,
        };
        const attributeData = {
          Username: users[i].username,
          UserPoolId: userPoolId,
          UserAttributes: users[i].attributes,
        };

        await cognitolib.createUser(poolData);
        // Set a temp password first, and then set the password configured in SSM for consistent dev login
        await cognitolib.setPassword(passwordData);
        // If user exists and attributes are updated in this file, updateUserAttributes is needed to update the attributes
        await cognitolib.updateUserAttributes(attributeData);
      }
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
