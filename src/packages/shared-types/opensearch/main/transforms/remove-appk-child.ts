import { removeAppkChildSchema } from "../../..";

export const transform = (id: string) => {
  return removeAppkChildSchema.transform((data) => {
    return {
      ...data,
      id,
      appkParentId: data.appkParentId,
      isAppkParent: false,
      origin: "OneMAC",
    };
  });
};

export type Schema = ReturnType<typeof transform>;
