import { seaChangedDateSchema } from "../../..";

export const transform = () => {
  return seaChangedDateSchema.transform((data) => {
    const transformedData = {
      id: data.ID_Number,
      changedDate:
        data.Changed_Date !== null && data.Changed_Date !== undefined
          ? new Date(data.Changed_Date).toISOString()
          : null,
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;

export const tombstone = (id: string) => {
  return {
    id,
    changedDate: null,
  };
};
