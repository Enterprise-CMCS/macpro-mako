import { state_plan_service_subtypesSchema } from "../../..";

export const transform = (id: string) => {
  return state_plan_service_subtypesSchema.transform((data) => {
    const transformedData = {
      id: data.ID_Number,
      subtypeId: data.Service_SubType_ID,
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;
