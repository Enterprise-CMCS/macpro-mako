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

export { emptyOSCpocSearchHandler, errorOSCpocSearchHandler } from "./cpocs";
export {
  errorCreateIndexHandler,
  errorUpdateFieldMappingHandler,
  errorBulkUpdateDataHandler,
  rateLimitBulkUpdateDataHandler,
  errorDeleteIndexHandler,
} from "./indices";
export { errorOSMainMultiDocumentHandler } from "./main";
export { errorSecurityRolesMappingHandler } from "./security";
export { errorOSSubtypeSearchHandler } from "./subtypes";
export { errorOSTypeSearchHandler } from "./types";
