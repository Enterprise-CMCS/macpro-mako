import { Handler } from "aws-lambda";
import * as cognitolib from "../../../libs/cognito-lib";
import { UserRoles, STATE_ROLES } from "shared-types";

if (!process.env.apiKey) {
  throw "ERROR:  process.env.apiKey is required,";
}
const apiKey: string = process.env.apiKey;

if (!process.env.apiEndpoint) {
  throw "ERROR:  process.env.apiEndpoint is required,";
}
const apiEndpoint: string = process.env.apiEndpoint;

export const handler: Handler = async (event, context) => {
  console.log(JSON.stringify(event, null, 2));
  const { request, response } = event;
  const { userAttributes } = request;

  if (!userAttributes.identities) {
    console.log("User is not managed externally.  Nothing to do.");
  } else {
    console.log("Getting user attributes from external API");

    try {
      const username = userAttributes["custom:username"]; // This is the four letter IDM username
      const response = await fetch(
        `${apiEndpoint}/api/v1/authz/id/all?userId=${username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
        },
      );
      if (!response.ok) {
        console.log(response);
        throw new Error(
          `Network response was not ok.  Response was ${response.status}: ${response.statusText}`,
        );
      }
      let data = await response.json();
      console.log(JSON.stringify(data, null, 2));
      let roleArray: string[] = [];
      let stateArray: string[] = [];
      data.userProfileAppRoles.userRolesInfoList.forEach((element: any) => {
        let role = element.roleName;
        if (Object.values(UserRoles).includes(role)) {
          roleArray.push(role);
          if (STATE_ROLES.includes(role)) {
            element.roleAttributes.forEach((attr: any) => {
              if ((attr.name = "State/Territory")) {
                stateArray.push(attr.value);
              }
            });
          }
        }
      });

      let attributeData: any = {
        Username: event.userName,
        UserPoolId: event.userPoolId,
        UserAttributes: [
          {
            Name: "custom:cms-roles",
            Value: roleArray.join(),
          },
          {
            Name: "custom:state",
            Value: stateArray.join(),
          },
        ],
      };
      console.log("Putting user attributes as: ");
      console.log(JSON.stringify(attributeData, null, 2));
      await cognitolib.updateUserAttributes(attributeData);
    } catch (error) {
      console.error("Error performing post auth:", error);
    }
  }
  return event;
};
