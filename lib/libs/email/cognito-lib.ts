import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandOutput,
  AttributeType,
} from "@aws-sdk/client-cognito-identity-provider";

const Cognito = new CognitoIdentityProviderClient({
  region: process.env.region,
});

interface UserAttributes {
  [key: string]: string | undefined;
}

// Have to get all users, as custom attributes (like state and role) are not searchable
export const getCognitoData = async (
  id: string | number,
): Promise<{ allState?: string; message?: string }> => {
  const lookupState = id.toString().substring(0, 2);
  try {
    const commandListUsers = new ListUsersCommand({
      UserPoolId: process.env.cognitoPoolId,
    });
    const listUsersResponse: ListUsersCommandOutput = await Cognito.send(
      commandListUsers,
    );
    const userList: string[] = listUsersResponse.Users?.map((user) => {
      const oneUser: UserAttributes = {};
      user.Attributes?.forEach((attribute: AttributeType) => {
        oneUser[attribute.Name as any] = attribute.Value;
      });
      if (
        oneUser["custom:cms-roles"] === "onemac-micro-statesubmitter" &&
        oneUser["custom:state"]?.includes(lookupState)
      ) {
        return `"${oneUser.family_name}, ${oneUser.given_name}" <${oneUser.email}>`;
      }
      return false;
    }).filter(Boolean) as string[];

    return { allState: userList.join(";") };
  } catch (error) {
    console.log("Cognito error is: ", error);
    return { message: (error as Error).message };
  }
};
