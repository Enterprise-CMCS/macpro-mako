import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { handleSmartAssignmentUpdated } from "./mspAssignmentUpdated";

/**
 * Applies a complete SMART CHIP SPA assignment-roster snapshot using the same
 * projection, ordering, and stale-event rules as Medicaid SPA assignments.
 */
export const handleChipSpaAssignmentUpdated = async (
  context: SmartOnemacEventContext,
): Promise<void> => handleSmartAssignmentUpdated(context, "CHIP SPA", "CHIPSPA_ASSIGNMENT_UPDATED");
