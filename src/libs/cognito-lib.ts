import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminUpdateUserAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";
const client = new CognitoIdentityProviderClient({ region: process.env.region });

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
    // Update the user's attributes
    const command = new AdminUpdateUserAttributesCommand(params);
    await client.send(command);
    console.log(`Attributes for user ${params.Username} updated successfully.`);
  } catch (error) {
    console.error("Error updating user's attributes:", error);
  }
}
