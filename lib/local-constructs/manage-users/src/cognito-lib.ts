import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: process.env.region || process.env.REGION_A || "us-east-1",
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
