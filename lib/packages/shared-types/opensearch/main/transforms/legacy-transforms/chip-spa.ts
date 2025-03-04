import { events, getStatus, SEATOOL_STATUS } from "shared-types";
import { seaToolFriendlyTimestamp } from "../../../../../shared-utils/seatool-date-helper";
import { ONEMAC_LEGACY_ORIGIN } from ".";
import { baseTransform } from "./common-legacy-transform";

export const transform = () => {
  return events["legacy-event"].legacyEventSchema.transform((data) => {
    // Use the shared transformation logic
    const baseResult = baseTransform(data);

    // Extend the result with specific fields for this transform
    return {
      ...baseResult,
      authority: "CHIP SPA"
    };
  });
};

export type Schema = ReturnType<typeof transform>;
