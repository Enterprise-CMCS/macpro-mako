import omit from "lodash/omit";

import { events } from "../../../../index";

export const transform = () => {
  return events["legacy-event"].legacyEventSchema.transform((data) => {
    const cleanData = omit(data, ["parentId"]);
    return {
      ...cleanData,
      cmsStatus: "Requested",
      stateStatus: "Submitted",
      authority: data.temporaryExtensionType ?? "1915(b)",
      actionType: "Extend",
      originalWaiverNumber: data.parentId,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
