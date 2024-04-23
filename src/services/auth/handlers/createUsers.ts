import * as cognitolib from "../../../libs/cognito-lib";
import users from "../libs/users.json";
const userPoolId = process.env.userPoolId;

exports.handler = async function myHandler() {
  console.log("USER POOL ID: ");
  console.log(userPoolId);

  const userData = users.map((user) => {
    const poolData = {
      UserPoolId: userPoolId,
      Username: user.username,
      UserAttributes: user.attributes,
      MessageAction: "SUPPRESS",
    };
    const passwordData = {
      Password: process.env.bootstrapUsersPassword,
      UserPoolId: userPoolId,
      Username: user.username,
      Permanent: true,
    };
    const attributeData = {
      Username: user.username,
      UserPoolId: userPoolId,
      UserAttributes: user.attributes,
    };

    return {
      attributeData,
      poolData,
      passwordData,
    };
  });

  try {
    await Promise.all(
      users.map((_user, i) => {
        return cognitolib.createUser(userData[i].poolData);
      }),
    );
    await Promise.all(
      users.map((_user, i) => {
        return cognitolib.setPassword(userData[i].passwordData);
      }),
    );
    await Promise.all(
      users.map((_user, i) => {
        return cognitolib.updateUserAttributes(userData[i].attributeData);
      }),
    );
  } catch (err: unknown) {
    console.log("ERROR", err);
  }
};
