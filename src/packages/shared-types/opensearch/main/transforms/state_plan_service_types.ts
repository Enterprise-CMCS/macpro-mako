import { state_plan_service_typesSchema } from "../../..";

export const transform = (id: string) => {
  return state_plan_service_typesSchema.transform((data) => {
    const transformedData = {
      id: data.ID_Number,
      typeId: data.Service_Type_ID,
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;
