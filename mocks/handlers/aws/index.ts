import { cloudFormationHandlers } from "./cloudFormation";
import { cognitoHandlers } from "./cognito";
import { credentialHandlers } from "./credentials";
import { secretsManagerHandlers } from "./secretsManager";

export const awsHandlers = [
  ...cloudFormationHandlers,
  ...cognitoHandlers,
  ...credentialHandlers,
  ...secretsManagerHandlers
];

export { errorCloudFormationHandler } from "./cloudFormation";
export { getRequestContext } from "./cognito";
