import { cpocHandlers } from "./cpocs";
import { itemHandlers } from "./items";
import { notificationHandlers } from "./notifications";
import { packageActionHandlers } from "./packageActions";
import { searchHandlers } from "./search";
import { submissionHandlers } from "./submissions";
import { typeHandlers } from "./types";
import { userDetailsHandlers } from "./userDetails";
import { userProfileHandlers } from "./userProfile";

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
];

export { errorApiCpocHandler } from "./cpocs";
export { onceApiItemHandler, errorApiItemHandler, errorApiItemExistsHandler } from "./items";
export { errorApiNotificationHandler } from "./notifications";
export { onceApiPackageActionsHandler, errorApiPackageActionsHandler } from "./packageActions";
export { errorApiSearchHandler } from "./search";
export { errorApiAttachmentUrlHandler } from "./submissions";
export { errorApiSubTypesHandler, errorApiTypeHandler } from "./types";
export { mockCurrentAuthenticatedUser, mockUseGetUser, mockUserAttributes } from "./user";
export { errorApiUserDetailsHandler, errorApiRequestBaseCMSAccessHandler } from "./userDetails";
export {
  defaultApiUserProfileHandler,
  errorApiUserProfileHandler,
  errorApiGetRoleRequestsHandler,
  errorApiGetCreateUserProfileHandler,
  errorApiOptionSubmitGroupDivisionHandler,
  errorApiSubmitRoleRequestsHandler,
} from "./userProfile";
