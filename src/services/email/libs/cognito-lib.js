import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  // UserType as CognitoUserType,
} from "@aws-sdk/client-cognito-identity-provider";

const Cognito = new CognitoIdentityProviderClient({
  region: process.env.region,
});

export const getCognitoData = async (id) => {
    try {

      const commandListUsers = new ListUsersCommand({
        UserPoolId: process.env.cognitoPoolId,
        // Filter: subFilter,
    });
    const listUsersResponse = await Cognito.send(commandListUsers);
        console.log("listUsers response: ", listUsersResponse);

      return { "allState": `'${id} State 1' <k.grue.stateuser@gmail.com>;'${id} State 2' <k.grue.stateadmn@gmail.com>`};
    } catch (error) {
      console.log("Cognito error is: ", error);
    }
  };