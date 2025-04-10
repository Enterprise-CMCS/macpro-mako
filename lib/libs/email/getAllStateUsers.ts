import {
  AttributeType,
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

type CognitoUserAttributes = {
  email?: string;
  given_name?: string;
  family_name?: string;
  "custom:state"?: string;
  [key: string]: string | undefined;
};

export const getAllStateUsers = async ({
  userPoolId,
  state,
}: {
  userPoolId: string;
  state: string;
}): Promise<StateUser[]> => {
  try {
    const params: ListUsersCommandInput = {
      UserPoolId: userPoolId,
      Limit: 60,
    };
    const command = new ListUsersCommand(params);
    const cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.region,
    });
    const response: ListUsersCommandOutput = await cognitoClient.send(command);

    if (!response.Users || response.Users.length === 0) {
      return [];
    }

    const filteredStateUsers = response.Users.filter((user) => {
      const stateAttribute = user.Attributes?.find(
        (attr): attr is AttributeType => attr.Name === "custom:state" && attr.Value !== undefined,
      );
      return stateAttribute?.Value?.split(",").includes(state);
    }).map((user) => {
      const attributes = user.Attributes?.reduce<CognitoUserAttributes>((acc, attr) => {
        if (attr.Name && attr.Value) {
          acc[attr.Name] = attr.Value;
        }
        return acc;
      }, {});

      // Skip users without valid email components
      if (!attributes?.email) {
        console.error(`No email found for user: ${JSON.stringify(user, null, 2)}`);
        return null;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(attributes.email)) {
        console.error(`Invalid email format for user: ${attributes.email}`);
        return null;
      }

      const formattedEmailAddress = `${attributes.given_name} ${attributes.family_name} <${attributes.email}>`;

      return {
        firstName: attributes.given_name ?? "",
        lastName: attributes.family_name ?? "",
        email: attributes.email,
        formattedEmailAddress,
      };
    });

    return filteredStateUsers.filter((user): user is StateUser => user !== null);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Error fetching users");
  }
};
