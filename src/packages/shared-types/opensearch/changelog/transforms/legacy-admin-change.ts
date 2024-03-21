import { legacyAdminChangeSchema, Action } from "../../..";

export const transform = (id: string) => {
  return legacyAdminChangeSchema.transform((data) => {
    const transformedData = {
      // Timestamp is what makes admin changes unique; we add it to the id here, instead of the offset
      id: `${id}-legacy-admin-change-${data.changeTimestamp}`,
      packageId: id,
      timestamp: data.changeTimestamp,
      actionType: Action.LEGACY_ADMIN_CHANGE,
      changeType: data.changeType,
      changeMade: data.changeMade,
      changeReason: data.changeReason,
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;
