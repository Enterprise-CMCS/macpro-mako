import { checkIdentifierUsageHandlers } from "./checkIdentifierUsage";
import { cpocHandlers } from "./cpocs";
import { itemHandlers } from "./items";
import { notificationHandlers } from "./notifications";
import { packageActionHandlers } from "./packageActions";
import { searchHandlers } from "./search";
import { submissionHandlers } from "./submissions";
import { typeHandlers } from "./types";
import { userDetailsHandlers } from "./userDetails";
import { userProfileHandlers } from "./userProfile";
import { webformHandlers } from "./webforms";

export const apiHandlers = [
  ...notificationHandlers,
  ...cpocHandlers,
  ...itemHandlers,
  ...packageActionHandlers,
  ...searchHandlers,
  ...submissionHandlers,
  ...typeHandlers,
  ...userDetailsHandlers,
  ...userProfileHandlers,
  ...webformHandlers,
  ...checkIdentifierUsageHandlers,
];

export { errorApiCheckIdentifierUsageHandler } from "./checkIdentifierUsage";
export { errorApiCpocHandler } from "./cpocs";
export { errorApiItemExistsHandler, errorApiItemHandler, onceApiItemHandler } from "./items";
export { errorApiNotificationHandler } from "./notifications";
export { errorApiPackageActionsHandler, onceApiPackageActionsHandler } from "./packageActions";
export { errorApiSearchHandler } from "./search";
export { errorApiAttachmentUrlHandler } from "./submissions";
export { errorApiSubTypesHandler, errorApiTypeHandler } from "./types";
export { mockCurrentAuthenticatedUser, mockUseGetUser, mockUserAttributes } from "./user";
export { errorApiRequestBaseCMSAccessHandler, errorApiUserDetailsHandler } from "./userDetails";
export {
  errorApiGetApproversHandler,
  errorApiGetCreateUserProfileHandler,
  errorApiGetRoleRequestsHandler,
  errorApiOptionSubmitGroupDivisionHandler,
  errorApiSubmitRoleRequestsHandler,
  errorApiUserProfileHandler,
} from "./userProfile";
