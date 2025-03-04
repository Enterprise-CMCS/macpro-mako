import { events, getStatus, SEATOOL_STATUS } from "shared-types";
import { seaToolFriendlyTimestamp } from "../../../../../shared-utils/seatool-date-helper";
import { LegacyEvent } from "../../../../events";
import { ONEMAC_LEGACY_ORIGIN } from ".";


export const transform = () => {
 return events["legacy-event"].legacyEventSchema.transform((data) => {
    // Use the shared transformation logic
    const baseResult = baseTransform(data);

    // Extend the result with specific fields for this transform
    return {
      ...baseResult,
      authority: "1915(c)",
      actionType: "Amendment",
      title: data.title,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
