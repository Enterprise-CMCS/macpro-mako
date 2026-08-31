import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { persistSmartOnemacEvent } from "./persistSmartOnemacEvent";

export const handleMspSplitSpaCreated = async (context: SmartOnemacEventContext): Promise<void> => {
  if (!(await persistSmartOnemacEvent(context))) {
    return;
  }
  // Reviewer hook: add OneMAC split-parent-link writes here.
};
