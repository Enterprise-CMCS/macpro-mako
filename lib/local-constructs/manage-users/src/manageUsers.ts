import { Handler } from "aws-lambda";
import { FAILED, send, SUCCESS } from "cfn-response-async";
import { getSecret } from "shared-utils";
import * as cognitolib from "./cognito-lib";
type ResponseStatus = typeof SUCCESS | typeof FAILED;

export const handler: Handler = async (event, context) => {
  const responseData: any = {};
  let responseStatus: ResponseStatus = SUCCESS;
  try {
    if (event.RequestType == "Create" || event.RequestType == "Update") {
      const { userPoolId, users, passwordSecretArn } = event.ResourceProperties;
      const devUserPassword = await getSecret(passwordSecretArn);

      for (let i = 0; i < users.length; i++) {
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
  } finally {
    await send(event, context, responseStatus, responseData, "static");
  }
};
