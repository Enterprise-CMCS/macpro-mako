import { Handler } from "aws-lambda";
import * as cognitolib from "../../../libs/cognito-lib";

if (!process.env.apiKey) {
  throw "ERROR:  process.env.apiKey is required,";
}
const apiKey: string = process.env.apiKey;

if (!process.env.apiEndpoint) {
  throw "ERROR:  process.env.apiEndpoint is required,";
}
const apiEndpoint: string = process.env.apiEndpoint;

export const handler: Handler = async (event, context) => {
  console.log(JSON.stringify(event,null,2));
  const { request, response } = event;
  const { userAttributes } = request;

  if(!userAttributes.identities){
    console.log("User is not managed externally.  Nothing to do.");
  } else {
    console.log("Getting user attributes from external API");
  
    try {
      const identity = JSON.parse(userAttributes.identities).find((obj: any) => obj.providerName === 'IDM')
      const userId = identity.userId;
      const response = await fetch(`${apiEndpoint}/authz/id?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        }
      });
      console.log(response);

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
