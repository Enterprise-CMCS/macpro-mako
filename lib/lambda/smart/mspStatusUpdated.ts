import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { persistSmartOnemacEvent } from "./persistSmartOnemacEvent";

export const handleMspStatusUpdated = async (context: SmartOnemacEventContext): Promise<void> => {
  if (!(await persistSmartOnemacEvent(context))) {
    return;
  }
  // Reviewer hook: add OneMAC package-status writes here.
};
