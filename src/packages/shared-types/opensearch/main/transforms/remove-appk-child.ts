import { removeAppkChildSchema } from "../../..";

export const transform = (id: string) => {
  return removeAppkChildSchema.transform((data) => {
    return {
      id,
      appkParentId: null,
      makoChangedDate: new Date(data.timestamp).toISOString(),
    };
  });
};

export type Schema = ReturnType<typeof transform>;
