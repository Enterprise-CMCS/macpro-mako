import { Handler } from "aws-lambda";
import { FAILED, send, SUCCESS } from "cfn-response-async";
import { getSecret } from "shared-utils";
import * as cognitolib from "./cognito-lib";
type ResponseStatus = typeof SUCCESS | typeof FAILED;

export const handler: Handler = async (event, context) => {
  console.log("handler request:", JSON.stringify(event, undefined, 2));
  console.log("handler context: ", JSON.stringify(context, null, 2));
  const responseData: any = {};
  let responseStatus: ResponseStatus = SUCCESS;
  try {
    if (event.RequestType == "Create" || event.RequestType == "Update") {
      const { userPoolId, users, passwordSecretArn } = event.ResourceProperties;
      console.log({ userPoolId, users, passwordSecretArn });
      const devUserPassword = await getSecret(passwordSecretArn);
      console.log("devUserPassword: ", JSON.stringify(devUserPassword, null, 2));

      for (let i = 0; i < users.length; i++) {
        console.log("user: ", JSON.stringify(users[i], null, 2));
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

        console.log("poolData: ", JSON.stringify(poolData, null, 2));
        const createResp = await cognitolib.createUser(poolData);
        console.log("create response: ", JSON.stringify(createResp, null, 2));
        // Set a temp password first, and then set the password configured in SSM for consistent dev login
        console.log("passwordData: ", JSON.stringify(passwordData, null, 2));
        const passwordResp = await cognitolib.setPassword(passwordData);
        console.log("password response: ", JSON.stringify(passwordResp, null, 2));
        // If user exists and attributes are updated in this file, updateUserAttributes is needed to update the attributes
        console.log("attributeData: ", JSON.stringify(attributeData, null, 2));
        const attrResp = await cognitolib.updateUserAttributes(attributeData);
        console.log("attribute response: ", JSON.stringify(attrResp, null, 2));
      }
    }
  } catch (error) {
    console.log(error);
    responseStatus = FAILED;
  } finally {
    await send(event, context, responseStatus, responseData, "static");
  }
};
