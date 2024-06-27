import { removeAppkChildSchema } from "../../..";

export const transform = (id: string) => {
  return removeAppkChildSchema.transform((data) => {
    return {
      id,
      appkParentId: null,
      makoChangedDate: !!data.timestamp
        ? new Date(data.timestamp).toISOString()
        : null,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
