import { events } from "../../../../index";

export const transform = () => {
  return events["legacy-event"].legacyEventSchema.transform((data) => {
    const { parentId, ...cleanData } = data;
    return {
      ...cleanData,
      cmsStatus: "Requested",
      stateStatus: "Submitted",
      authority: data.temporaryExtensionType ?? "1915(b)",
      actionType: "Extend",
      originalWaiverNumber: parentId,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
