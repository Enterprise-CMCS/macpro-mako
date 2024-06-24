import { removeAppkChildSchema } from "../../..";

export const transform = (id: string) => {
  return removeAppkChildSchema.transform(() => {
    return {
      id,
      appkParentId: null,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
