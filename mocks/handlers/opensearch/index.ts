import { changelogSearchHandlers } from "./changelog";
import { cpocSearchHandlers } from "./cpocs";
import { indexHandlers } from "./indices";
import { mainSearchHandlers } from "./main";
import { roleHandlers } from "./roles";
import { securityHandlers } from "./security";
import { subtypeSearchHandlers } from "./subtypes";
import { typeSearchHandlers } from "./types";
import { userHandlers } from "./users";

export const opensearchHandlers = [
  ...changelogSearchHandlers,
  ...cpocSearchHandlers,
  ...indexHandlers,
  ...mainSearchHandlers,
  ...roleHandlers,
  ...securityHandlers,
  ...subtypeSearchHandlers,
  ...typeSearchHandlers,
  ...userHandlers,
];

export { errorOSChangelogSearchHandler } from "./changelog";
export { emptyOSCpocSearchHandler, errorOSCpocSearchHandler } from "./cpocs";
export {
  errorCreateIndexHandler,
  errorUpdateFieldMappingHandler,
  errorBulkUpdateDataHandler,
  rateLimitBulkUpdateDataHandler,
  errorDeleteIndexHandler,
} from "./indices";
export { errorOSMainMultiDocumentHandler } from "./main";
export { errorRoleSearchHandler } from "./roles";
export { errorSecurityRolesMappingHandler } from "./security";
export { errorOSSubtypeSearchHandler } from "./subtypes";
export { errorOSTypeSearchHandler } from "./types";
