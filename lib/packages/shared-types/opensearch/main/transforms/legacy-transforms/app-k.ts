import { events } from "../../../../index";

export const transform = () => {
  return events["legacy-event"].legacyEventSchema.transform((data) => {
    return {
      ...data,
      authority: "1915(c)",
      actionType: "Amend",
      title: data.title,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
