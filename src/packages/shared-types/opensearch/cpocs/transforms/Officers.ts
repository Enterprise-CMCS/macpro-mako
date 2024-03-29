import { seaOfficersSchema } from "../../..";

export const transform = () => {
  return seaOfficersSchema.transform((data) => {
    const transformedData = {
      id: data.Officer_ID,
      firstName: data.First_Name,
      lastName: data.Last_Name,
      email: data.Email,
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;
