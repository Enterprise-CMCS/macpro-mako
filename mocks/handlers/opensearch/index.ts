import { changelogSearchHandlers } from "./changelog";
import { cpocSearchHandlers } from "./cpocs";
import { indexHandlers } from "./indices";
import { mainSearchHandlers } from "./main";
import { securityHandlers } from "./security";
import { subtypeSearchHandlers } from "./subtypes";
import { typeSearchHandlers } from "./types";

export const opensearchHandlers = [
  ...changelogSearchHandlers,
  ...cpocSearchHandlers,
  ...indexHandlers,
  ...mainSearchHandlers,
  ...securityHandlers,
  ...subtypeSearchHandlers,
  ...typeSearchHandlers,
];

export { emptyCpocSearchHandler, errorCpocSearchHandler } from "./cpocs";
export { errorDeleteIndexHandler } from "./indices";
export { errorSecurityRolesMappingHandler } from "./security";
