import { events } from "shared-types";
import { baseTransform } from "./common-legacy-transform";

export const transform = () => {
  return events["legacy-event"].legacyEventSchema.transform((data) => {
    return {
      ...data,
      authority: "Medicaid SPA",
    };
  });
};

export type Schema = ReturnType<typeof transform>;
