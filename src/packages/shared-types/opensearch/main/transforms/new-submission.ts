import { onemacSchema } from "../../..";

export const transform = (id: string) => {
  return onemacSchema.transform((data) => {
    const transformedData = {
      id,
      appkParentId: data.appkParentId,
      raiWithdrawEnabled: data.raiWithdrawEnabled,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
      origin: "OneMAC", // Marks this as having originated from *either* legacy or micro
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;
