import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  // UserType as CognitoUserType,
} from "@aws-sdk/client-cognito-identity-provider";

const Cognito = new CognitoIdentityProviderClient({
  region: process.env.region,
});

// have to get all users, as custom attributes (like state and role) are not searchable
export const getCognitoData = async (id) => {
    try {

      const commandListUsers = new ListUsersCommand({
        UserPoolId: process.env.cognitoPoolId,
    });
    const listUsersResponse = await Cognito.send(commandListUsers);
        console.log("listUsers response: ", listUsersResponse);
        const userAttributesList = listUsersResponse.Users.map((response) => {
          return response.Attributes;
        })
        console.log("listUsers Attributes: ", JSON.stringify(userAttributesList, null, 4));

      return { "allState": `'${id} State 1' <k.grue.stateuser@gmail.com>;'${id} State 2' <k.grue.stateadmn@gmail.com>`};
    } catch (error) {
      console.log("Cognito error is: ", error);
    }
  };