import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Handler } from "aws-lambda";

const cognitoClient = new CognitoIdentityProviderClient();

export const handler: Handler = async (event) => {
  console.log("getAllStateUsers has been called");
  console.log(JSON.stringify(event, null, 2));
  try {
    const params = {
      UserPoolId: process.env.USER_POOL_ID,
      Filter: `cognito:user_status = "CONFIRMED"`,
    };

    const command = new ListUsersCommand(params);
    const response = await cognitoClient.send(command);

    const filteredUsers = response.Users?.filter(
      (user) =>
        user.Enabled === true &&
        user.UserStatus === "CONFIRMED" &&
        user.Attributes?.some(
          (attr) =>
            attr.Name === "custom:state" &&
            attr.Value?.split(",").includes(event.state),
        ),
    );

    const formattedUsers = filteredUsers?.map((user) => {
      const attributes = user.Attributes?.reduce((acc, attr) => {
        acc[attr.Name as any] = attr.Value;
        return acc;
      }, {} as Record<string, string | undefined>);

      return {
        firstName: attributes?.["given_name"],
        lastName: attributes?.["family_name"],
        email: attributes?.["email"],
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(formattedUsers),
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error fetching users" }),
    };
  }
};

export default handler;
