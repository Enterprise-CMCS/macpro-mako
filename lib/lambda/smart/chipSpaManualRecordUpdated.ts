import { z } from "zod";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { persistSmartOnemacEvent } from "./persistSmartOnemacEvent";
import { reportSmartValidationFailure } from "./smartEventHelpers";

const chipSpaManualRecordUpdatedSchema = z.object({
  authority: z.literal("CHIP SPA"),
  creationContext: z.literal("MANUAL"),
  operationType: z.literal("CHIPSPA_MANUAL_RECORD_UPDATED"),
});

/**
 * Links an existing OneMAC CHIP SPA to its SMART identity or creates a hidden
 * reservation that prevents the package ID from being reused in OneMAC.
 */
export const handleChipSpaManualRecordUpdated = async (
  context: SmartOnemacEventContext,
): Promise<void> => {
  const contract = chipSpaManualRecordUpdatedSchema.safeParse(context.event);
  if (!contract.success) {
    await reportSmartValidationFailure(context, contract.error);
    return;
  }

  if (!(await persistSmartOnemacEvent(context))) {
    return;
  }
};
