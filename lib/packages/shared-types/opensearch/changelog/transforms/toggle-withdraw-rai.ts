import { events } from "shared-types";
export const transform = (offset: number) => {
  return events["toggle-withdraw-rai"].schema.transform((data) => {
    return {
      ...data,
      packageId: data.id,
      id: `${data.id}-${offset}`,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
