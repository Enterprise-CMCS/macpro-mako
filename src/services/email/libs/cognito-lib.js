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
    const lookupState = id.toString().substring(0, 2);
    try {
  
      const commandListUsers = new ListUsersCommand({
        UserPoolId: process.env.cognitoPoolId,
      });
      const listUsersResponse = await Cognito.send(commandListUsers);
      const userList = listUsersResponse.Users.map((user) => {
        let oneUser = {};
        user.Attributes.forEach((attribute) => {
          oneUser[attribute.Name] = attribute.Value;
        });
        if (oneUser["custom:cms-roles"] === "onemac-micro-statesubmitter" &&
          oneUser["custom:state"].includes(lookupState))
          return `"${oneUser.family_name}, ${oneUser.given_name}" <${oneUser.email}>`;
      }).filter(Boolean);
  
      return { "allState": userList.join(";") };
    } catch (error) {
      console.log("Cognito error is: ", error);
      return {"message": error.message };
    }
  };