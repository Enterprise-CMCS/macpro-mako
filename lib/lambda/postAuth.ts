import { Handler } from "aws-lambda";
import { UserRoles, STATE_ROLES } from "shared-types";
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { getSecret } from "shared-utils";

// Initialize Cognito client
const client = new CognitoIdentityProviderClient({});

export const handler: Handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));

  // Check if idmInfoSecretArn is provided
  if (!process.env.idmAuthzApiKeyArn) {
    throw "ERROR: process.env.idmAuthzApiKeyArn is required";
  }
  if (!process.env.idmAuthzApiEndpoint) {
    throw "ERROR: process.env.idmAuthzApiKeyArn is required";
  }

  const apiEndpoint: string = process.env.idmAuthzApiEndpoint;
  let apiKey: string;
  try {
    apiKey = await getSecret(process.env.idmAuthzApiKeyArn);
  } catch (error) {
    console.error("Error retrieving secret from Secrets Manager:", error);
    throw error;
  }

  const { request } = event;
  const { userAttributes } = request;

  if (!userAttributes.identities) {
    console.log("User is not managed externally. Nothing to do.");
  } else {
    console.log("Getting user attributes from external API");

    try {
      const username = userAttributes["custom:username"]; // This is the four-letter IDM username
      const response = await fetch(`${apiEndpoint}/api/v1/authz/id/all?userId=${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      });
      if (!response.ok) {
        console.log(response);
        throw new Error(
          `Network response was not ok. Response was ${response.status}: ${response.statusText}`,
        );
      }
      const data = await response.json();
      console.log(JSON.stringify(data, null, 2));
      const roleArray: string[] = [];
      const stateArray: string[] = [];
      data.userProfileAppRoles.userRolesInfoList.forEach((element: any) => {
        const role = element.roleName;
        if (Object.values(UserRoles).includes(role)) {
          roleArray.push(role);
          if (STATE_ROLES.includes(role)) {
            element.roleAttributes.forEach((attr: any) => {
              if (attr.name === "State/Territory") {
                stateArray.push(attr.value);
              }
            });
          }
        }
      });

      const attributeData: any = {
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
      await updateUserAttributes(attributeData);
    } catch (error) {
      console.error("Error performing post auth:", error);
    }
  }
  return event;
};

async function updateUserAttributes(params: any): Promise<void> {
  try {
    // Fetch existing user attributes
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: params.UserPoolId,
      Username: params.Username,
    });
    const user = await client.send(getUserCommand);

    // Check for existing "custom:cms-roles"
    const cmsRolesAttribute = user.UserAttributes?.find((attr) => attr.Name === "custom:cms-roles");
    const existingRoles =
      cmsRolesAttribute && cmsRolesAttribute.Value ? cmsRolesAttribute.Value.split(",") : [];

    // Check for existing "custom:state"
    const stateAttribute = user.UserAttributes?.find((attr) => attr.Name === "custom:state");
    const existingStates =
      stateAttribute && stateAttribute.Value ? stateAttribute.Value.split(",") : [];

    // Prepare for updating user attributes
    const attributeData: any = {
      UserPoolId: params.UserPoolId,
      Username: params.Username,
      UserAttributes: params.UserAttributes,
    };

    // Ensure "onemac-micro-super" is preserved
    if (existingRoles.includes("onemac-micro-super")) {
      const rolesIndex = attributeData.UserAttributes.findIndex(
        (attr: any) => attr.Name === "custom:cms-roles",
      );
      if (rolesIndex !== -1) {
        // Only merge if new roles are not empty
        const newRoles = attributeData.UserAttributes[rolesIndex].Value
          ? new Set(
              attributeData.UserAttributes[rolesIndex].Value.split(",").concat(
                "onemac-micro-super",
              ),
            )
          : new Set(["onemac-micro-super"]); // Ensure "onemac-micro-super" is always included
        attributeData.UserAttributes[rolesIndex].Value = Array.from(newRoles).join(",");
      } else {
        // Add "custom:cms-roles" with "onemac-micro-super"
        attributeData.UserAttributes.push({
          Name: "custom:cms-roles",
          Value: "onemac-micro-super",
        });
      }
    }

    // Ensure "ZZ" state is preserved
    if (existingStates.includes("ZZ")) {
      const stateIndex = attributeData.UserAttributes.findIndex(
        (attr: any) => attr.Name === "custom:state",
      );
      if (stateIndex !== -1) {
        // Only merge if new states are not empty
        const newStates = attributeData.UserAttributes[stateIndex].Value
          ? new Set(attributeData.UserAttributes[stateIndex].Value.split(",").concat("ZZ"))
          : new Set(["ZZ"]); // Ensure "ZZ" is always included
        attributeData.UserAttributes[stateIndex].Value = Array.from(newStates).join(",");
      } else {
        // Add "custom:state" with "ZZ"
        attributeData.UserAttributes.push({
          Name: "custom:state",
          Value: "ZZ",
        });
      }
    }

    // Update the user's attributes
    const updateCommand = new AdminUpdateUserAttributesCommand(attributeData);
    await client.send(updateCommand);
    console.log(`Attributes for user ${params.Username} updated successfully.`);
  } catch (error) {
    console.error("Error updating user's attributes:", error);
  }
}
