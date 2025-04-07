import { events } from "../../../../index";

export const transform = () => {
  return events["legacy-event"].legacyEventSchema.transform((data) => {
    return {
      ...data,
      authority: "Medicaid SPA",
    };
  });
};

export type Schema = ReturnType<typeof transform>;
