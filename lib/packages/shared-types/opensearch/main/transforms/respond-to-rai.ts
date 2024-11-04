import { events } from "shared-types";
export const transform = (id: string) => {
  return events["respond-to-rai"].schema.transform((data) => ({
    id,
    makoChangedDate: data.timestamp ? new Date(data.timestamp).toISOString() : null,
  }));
};

export type Schema = ReturnType<typeof transform>;
