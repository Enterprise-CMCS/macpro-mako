import { changelogSearchHandlers } from "./changelog";
import { cpocSearchHandlers } from "./cpocs";
import { mainSearchHandlers } from "./main";
import { typeSearchHandlers } from "./types"
import { subtypeSearchHandlers } from "./subtypes";

export const opensearchHandlers = [
  ...changelogSearchHandlers,
  ...cpocSearchHandlers,
  ...mainSearchHandlers,
  ...typeSearchHandlers,
  ...subtypeSearchHandlers,
];

export { emptyCpocSearchHandler, errorCpocSearchHandler } from "./cpocs"
