import { cloudFormationHandlers } from "./cloudFormation";
import { cognitoHandlers } from "./cognito";
import { credentialHandlers } from "./credentials";
import { emailHandlers } from "./email";
import { idmHandlers } from "./idm";
import { lambdaHandlers } from "./lambda";
import { secretsManagerHandlers } from "./secretsManager";
import { ssmHandlers } from "./ssm";
import { stepFunctionHandlers } from "./stepFunctions";

export const awsHandlers = [
  ...cloudFormationHandlers,
  ...cognitoHandlers,
  ...credentialHandlers,
  ...lambdaHandlers,
  ...secretsManagerHandlers,
  ...ssmHandlers,
  ...stepFunctionHandlers,
  ...emailHandlers,
  ...idmHandlers,
];

export { errorCloudFormationHandler } from "./cloudFormation";
export {
  cognitoHandlers,
  getRequestContext,
  identityProviderServiceHandler,
  emptyIdentityProviderServiceHandler,
  errorIdentityProviderServiceHandler,
} from "./cognito";
