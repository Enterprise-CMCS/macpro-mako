import { removeAppkChildSchema } from "../../..";

export const transform = (id: string) => {
  return removeAppkChildSchema.transform((data) => {
    return {
      ...data,
      id,
      appkParentId: null,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
