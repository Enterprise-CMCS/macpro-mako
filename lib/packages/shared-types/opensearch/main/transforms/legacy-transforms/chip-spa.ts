import { events } from "../../../../index";

export const transform = () => {
  return events["legacy-event"].legacyEventSchema.transform((data) => {
    return {
      ...data,
      authority: "CHIP SPA",
    };
  });
};

export type Schema = ReturnType<typeof transform>;
