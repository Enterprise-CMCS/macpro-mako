import { events } from "shared-types";
import { baseTransform } from "./common-legacy-transform";


export const transform = () => {
  return events["legacy-event"].legacyEventSchema.transform((data) => {
    // Use the shared transformation logic
    const baseResult = baseTransform(data);

    // Extend the result with specific fields for this transform
    return {
      ...baseResult,
      authority: "Medicaid SPA",
    };
  });
};

export type Schema = ReturnType<typeof transform>;
