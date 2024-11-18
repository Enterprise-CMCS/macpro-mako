import { events } from "../../../events";

export const transform = () => {
  return events["upload-subsequent-documents"].schema.transform((data) => ({
    id: data.id,
    makoChangedDate: data.timestamp
      ? new Date(data.timestamp).toISOString()
      : null,
  }));
};

export type Schema = ReturnType<typeof transform>;
