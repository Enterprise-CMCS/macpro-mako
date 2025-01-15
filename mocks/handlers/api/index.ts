import { itemHandlers } from "./items";
import { submissionHandlers } from "./submissions";
import { notificationHandlers } from "./notifications";
import { typeHandlers } from "./types";

export const apiHandlers = [
  ...itemHandlers,
  ...submissionHandlers,
  ...typeHandlers,
  ...notificationHandlers,
];

export { mockCurrentAuthenticatedUser, mockUseGetUser, mockUserAttributes } from "./user";
