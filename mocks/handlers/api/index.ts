import { cpocHandlers } from "./cpocs";
import { itemHandlers } from "./items";
import { packageActionHandlers } from "./packageActions";
import { searchHandlers } from "./search";
import { submissionHandlers } from "./submissions";
import { typeHandlers } from "./types";

export const apiHandlers = [
  ...cpocHandlers,
  ...itemHandlers,
  ...packageActionHandlers,
  ...searchHandlers,
  ...submissionHandlers,
  ...typeHandlers,
];

export { errorApiCpocHandler } from "./cpocs";
export { errorApiItemHandler, errorApiItemExistsHandler } from "./items";
export { errorApiPackageActionsHandler } from "./packageActions";
export { errorApiSearchHandler } from "./search";
export { errorApiAttachmentUrlHandler } from "./submissions";
export { errorApiSubTypesHandler, errorApiTypeHandler } from "./types";
export { mockCurrentAuthenticatedUser, mockUseGetUser, mockUserAttributes } from "./user";
