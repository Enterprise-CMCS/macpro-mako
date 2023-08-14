import * as cognitolib from "../../../libs/cognito-lib";
import * as users from "../libs/users.json";
const kibanaUserPoolId = process.env.kibanaUserPoolId;

exports.handler = async function myHandler() {
  console.log("KIBANA USER POOL ID: ");
  console.log(kibanaUserPoolId);

  for (let i = 0; i < users.length; i++) {
    console.log(users[i]);
    const poolData = {
      UserPoolId: kibanaUserPoolId,
      Username: users[i].username,
      UserAttributes: users[i].attributes,
      MessageAction: "SUPPRESS",
    };
    const passwordData = {
      Password: process.env.bootstrapUsersPassword,
      UserPoolId: kibanaUserPoolId,
      Username: users[i].username,
      Permanent: true,
    };
    const attributeData = {
      Username: users[i].username,
      UserPoolId: kibanaUserPoolId,
      UserAttributes: users[i].attributes,
    };

    await cognitolib.createUser(poolData);
    // Set a temp password first, and then set the password configured in SSM for consistent dev login
    await cognitolib.setPassword(passwordData);
    // If user exists and attributes are updated in this file, updateUserAttributes is needed to update the attributes
    await cognitolib.updateUserAttributes(attributeData);
  }
};
