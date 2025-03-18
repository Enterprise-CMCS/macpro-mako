import { events } from "shared-types";

export const transform = () => {
  return events["legacy-event"].legacyEventSchema.transform((data) => {
    return {
      ...data,
      authority: "1915(b)",
      actionType: "Renewal",
    };
  });
};

export type Schema = ReturnType<typeof transform>;
