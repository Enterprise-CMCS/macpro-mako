import { cloudFormationHandlers } from "./cloudFormation";
import { cognitoHandlers } from "./cognito";
import { credentialHandlers } from "./credentials";
import { lambdaHandlers } from "./lambda";
import { secretsManagerHandlers } from "./secretsManager";
import { stepFunctionHandlers } from "./stepFunctions";
import { emailHandlers } from "./email";
import { idmHandlers } from "./idm";
export const awsHandlers = [
  ...cloudFormationHandlers,
  ...cognitoHandlers,
  ...credentialHandlers,
  ...lambdaHandlers,
  ...secretsManagerHandlers,
  ...stepFunctionHandlers,
  ...emailHandlers,
  ...idmHandlers,
];

export { errorCloudFormationHandler } from "./cloudFormation";
export { getRequestContext } from "./cognito";
