import { events } from "../../../index";

export const transform = () => {
  return events["ce-subsequent-documents"].schema.transform((data) => ({
    id: data.id,
    makoChangedDate: new Date(data.timestamp).toISOString(),
  }));
};

export type Schema = ReturnType<typeof transform>;
