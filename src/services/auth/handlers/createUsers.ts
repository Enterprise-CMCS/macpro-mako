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

  const createUserPromises = users.map((_user, i) => {
    return cognitolib.createUser(userData[i].poolData);
  });

  const setPasswordPromises = users.map((_user, i) => {
    return cognitolib.setPassword(userData[i].passwordData);
  });

  const updateUserAttrsPromises = users.map((_user, i) => {
    return cognitolib.updateUserAttributes(userData[i].attributeData);
  });

  try {
    await Promise.all(createUserPromises);
    await Promise.all(setPasswordPromises);
    await Promise.all(updateUserAttrsPromises);
  } catch (err: unknown) {
    console.log("ERROR", err);
  }
};
