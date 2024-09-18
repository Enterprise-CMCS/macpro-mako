import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandInput,
  ListUsersCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

export type StateUser = {
  firstName: string;
  lastName: string;
  email: string;
  formattedEmailAddress: string;
};

const cognitoClient = new CognitoIdentityProviderClient();

export const getAllStateUsers = async (state: string): Promise<StateUser[]> => {
  try {
    const params: ListUsersCommandInput = {
      UserPoolId: process.env.userPoolId,
      Limit: 60,
      Filter: `attribute_name = "custom:state" and contains(attribute_value, "${state}")`,
    };

    const command = new ListUsersCommand(params);
    const response: ListUsersCommandOutput = await cognitoClient.send(command);

    if (!response.Users || response.Users.length === 0) {
      return [];
    }

    const allStateUsers = response.Users.map((user) => {
      const attributes = user.Attributes?.reduce((acc, attr) => {
        acc[attr.Name as any] = attr.Value;
        return acc;
      }, {} as Record<string, string | undefined>);

      return {
        firstName: attributes?.["given_name"],
        lastName: attributes?.["family_name"],
        email: attributes?.["email"],
        formattedEmailAddress: `${attributes?.["given_name"]} ${attributes?.["family_name"]} <${attributes?.["email"]}>`,
      };
    });

    return allStateUsers as StateUser[];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Error fetching users");
  }
};
