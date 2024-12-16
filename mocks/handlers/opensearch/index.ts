import { defaultChangelogSearchHandler } from "./changelog";
import { defaultMainDocumentHandler, defaultMainSearchHandler } from "./main";
import { defaultTypeSearchHandler } from "./types"
import { defaultSubtypeSearchHandler } from "./subtypes";

export const defaultHandlers = [
  defaultChangelogSearchHandler,
  defaultMainDocumentHandler,
  defaultMainSearchHandler,
  defaultTypeSearchHandler,
  defaultSubtypeSearchHandler
];
