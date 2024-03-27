import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
const client = new CognitoIdentityProviderClient({
  region: process.env.region,
});

export async function createUser(params: any): Promise<void> {
  try {
    const command = new AdminCreateUserCommand(params);
    await client.send(command);
    console.log(`User ${params.Username} created successfully.`);
  } catch (error) {
    console.error(`Error creating user:`, error);
  }
}

export async function setPassword(params: any): Promise<void> {
  try {
    // Set the user's password
    const command = new AdminSetUserPasswordCommand(params);
    await client.send(command);

    console.log(`Password for user ${params.Username} set successfully.`);
  } catch (error) {
    console.error("Error setting user's password:", error);
  }
}

export async function updateUserAttributes(params: any): Promise<void> {
  try {
    // Fetch existing user attributes to check for "onemac-micro-super"
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: params.UserPoolId,
      Username: params.Username,
    });
    const user = await client.send(getUserCommand);
    const cmsRolesAttribute = user.UserAttributes?.find(
      (attr) => attr.Name === "custom:cms-roles",
    );
    const existingRoles =
      cmsRolesAttribute && cmsRolesAttribute.Value
        ? cmsRolesAttribute.Value.split(",")
        : [];

    // Prepare for updating user attributes
    let attributeData: any = {
      UserPoolId: params.UserPoolId,
      Username: params.Username,
      UserAttributes: params.UserAttributes,
    };

    // Ensure "onemac-micro-super" is included if it was already present
    if (existingRoles.includes("onemac-micro-super")) {
      const rolesIndex = attributeData.UserAttributes.findIndex(
        (attr: any) => attr.Name === "custom:cms-roles",
      );
      if (rolesIndex !== -1) {
        // Merge existing roles with new roles, ensuring "onemac-micro-super" is included
        let newRoles = new Set(
          attributeData.UserAttributes[rolesIndex].Value.split(",").concat(
            "onemac-micro-super",
          ),
        );
        attributeData.UserAttributes[rolesIndex].Value =
          Array.from(newRoles).join(",");
      } else {
        // If "custom:cms-roles" wasn't in the incoming event, add it with "onemac-micro-super"
        attributeData.UserAttributes.push({
          Name: "custom:cms-roles",
          Value: "onemac-micro-super",
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
