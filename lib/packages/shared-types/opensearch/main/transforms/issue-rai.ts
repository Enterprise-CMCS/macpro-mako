import { raiIssueSchema } from "../../..";

export const transform = (id: string) => {
  return raiIssueSchema.transform((data) => ({
    id,
    makoChangedDate: data.timestamp
      ? new Date(data.timestamp).toISOString()
      : null,
  }));
};

export type Schema = ReturnType<typeof transform>;
