import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandInput,
  ListUsersCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

export interface StateUser {
  firstName: string;
  lastName: string;
  email: string;
  formattedEmailAddress: string;
}

const cognitoClient = new CognitoIdentityProviderClient({});

/**
 * Fetches all state users from Cognito for a given state.
 * @param userPoolId The Cognito User Pool ID
 * @param state The state code to filter users by
 * @returns Promise<StateUser[]>
 */
export const getAllStateUsers = async ({
  userPoolId,
  state,
}: {
  userPoolId: string;
  state: string;
}): Promise<StateUser[]> => {
  const params: ListUsersCommandInput = {
    UserPoolId: userPoolId,
    Limit: 60,
  };

  const command = new ListUsersCommand(params);
  let response: ListUsersCommandOutput;
  try {
    response = await cognitoClient.send(command);
  } catch (error) {
    console.error("Error fetching users from Cognito:", error);
    throw new Error("Error fetching users from Cognito");
  }

  if (!response.Users || response.Users.length === 0) {
    return [];
  }

  const filteredStateUsers: StateUser[] = response.Users.reduce((acc: StateUser[], user) => {
    const stateAttr = user.Attributes?.find((attr) => attr.Name === "custom:state");
    const userStates = stateAttr?.Value?.split(",") ?? [];
    if (!userStates.includes(state)) {
      return acc;
    }

    const attributes = user.Attributes?.reduce((a, attr) => {
      if (attr.Name && attr.Value) a[attr.Name] = attr.Value;
      return a;
    }, {} as Record<string, string>) || {};

    if (!attributes["given_name"] || !attributes["family_name"] || !attributes["email"]) {
      console.warn(
        `User ${user.Username} missing required attributes (given_name, family_name, email)`
      );
      return acc;
    }

    const firstName = attributes["given_name"];
    const lastName = attributes["family_name"];
    const email = attributes["email"];

    acc.push({
      firstName,
      lastName,
      email,
      formattedEmailAddress: `${firstName} ${lastName} <${email}>`,
    });

    return acc;
  }, []);

  return filteredStateUsers;
};