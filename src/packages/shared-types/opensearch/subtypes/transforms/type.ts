import { seaSubtypeSchema } from "../../..";

export const transform = (id: string) => {
  return seaSubtypeSchema.transform((data) => {
    const transformedData = {
      id: data.Type_Id,
      name: data.Type_Name,
      typeId: data.Type_Class,
      authorityId: data.Plan_Type_ID,
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;
