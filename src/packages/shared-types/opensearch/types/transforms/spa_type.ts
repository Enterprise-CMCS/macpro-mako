import { seaTypeSchema } from "../../..";

export const transform = () => {
  return seaTypeSchema.transform((data) => {
    const transformedData = {
      id: data.SPA_Type_ID,
      name: data.SPA_Type_Name,
      authorityId: data.Plan_Type_ID,
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;
