import { Handler } from "aws-lambda";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
const client = new SecretsManagerClient({});
import * as cognitolib from "../../../libs/cognito-lib";

if (!process.env.authzInfoPath) {
  throw "ERROR:  process.env.authzInfoPath is required,";
}
const authzInfoPath: string = process.env.authzInfoPath;

export const handler: Handler = async (event, context) => {
  console.log(JSON.stringify(event,null,2));
  const { request, response } = event;
  const { userAttributes } = request;

  if(!userAttributes.identities){
    console.log("User is not managed externally.  Nothing to do.");
  } else {
    console.log("Getting user attributes from external API");

    const params = {
      SecretId: authzInfoPath, // Replace with the name of your secret
    };
  
    const command = new GetSecretValueCommand(params);
  
    try {
      const data = await client.send(command);
      const info = JSON.parse(data.SecretString || "");
      var attributeData :any = {
        Username: event.userName,
        UserPoolId: event.userPoolId,
        UserAttributes: [
          {
            "Name": "custom:cms-roles",
            "Value": "cms-system-admin"
          }
        ],
      };
      await cognitolib.updateUserAttributes(attributeData);

    } catch (error) {
      console.error("Error fetching secret:", error);
    }

  }
  return event;
};
