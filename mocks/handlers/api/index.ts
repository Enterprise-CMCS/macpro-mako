import { cpocHandlers } from "./cpocs";
import { itemHandlers } from "./items";
import { submissionHandlers } from "./submissions";
import { typeHandlers } from "./types";

export const apiHandlers = [
  ...cpocHandlers,
  ...itemHandlers,
  ...submissionHandlers,
  ...typeHandlers,
];

export { errorCpocHandler } from "./cpocs";

export { errorItemHandler, errorItemExistsHandler } from "./items";

export { errorAttachmentUrlHandler } from "./submissions";

export { errorSubTypesHandler, errorTypeHandler } from "./types";

export { mockCurrentAuthenticatedUser, mockUseGetUser, mockUserAttributes } from "./user";
