import { itemHandlers } from "./items";
import { submissionHandlers } from "./submissions";
import { typeHandlers } from "./types";

export const apiHandlers = [
  ...itemHandlers,
  ...submissionHandlers,
  ...typeHandlers
];

export {
  mockCurrentAuthenticatedUser,
  mockUseGetUser,
  mockUserAttributes,
} from "./user";
