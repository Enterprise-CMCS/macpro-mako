import { events } from "shared-types";

export const transform = () => {
  return events["legacy-event"].legacyEventSchema.transform((data) => {
    //destructure to remove unwanted data fields
    const { statusDate, parentId, state, ...cleanData } = data;
    return {
      ...cleanData,
      authority: data.temporaryExtensionType ?? "1915(b)",
      actionType: "Extend",
      originalWaiverNumber: data.parentId,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
