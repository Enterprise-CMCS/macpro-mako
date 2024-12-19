import { changelogSearchHandlers } from "./changelog";
import { mainSearchHandlers } from "./main";
import { typeSearchHandlers } from "./types"
import { subtypeSearchHandlers } from "./subtypes";

export const opensearchHandlers = [
  ...changelogSearchHandlers,
  ...mainSearchHandlers,
  ...typeSearchHandlers,
  ...subtypeSearchHandlers,
];
