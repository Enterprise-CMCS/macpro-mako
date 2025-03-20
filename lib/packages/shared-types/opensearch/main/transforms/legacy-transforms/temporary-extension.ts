import omit from "lodash/omit";
import { events } from "shared-types";

export const transform = () => {
  return events["legacy-event"].legacyEventSchema.transform((data) => {
    const cleanData = omit(data, ["statusDate", "state", "parentId"]);
    return {
      ...cleanData,
      authority: data.temporaryExtensionType ?? "1915(b)",
      actionType: "Extend",
      originalWaiverNumber: data.parentId,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
