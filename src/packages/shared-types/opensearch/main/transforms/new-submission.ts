import { onemacSchema } from "../../..";

export const transform = (id: string) => {
  return onemacSchema.transform((data) => {
    const transformedData = {
      id,
      attachments: data.attachments,
      appkParentId: data.appkParentId,
      isAppkParent: data.isAppkParent,
      raiWithdrawEnabled: data.raiWithdrawEnabled,
      additionalInformation: data.additionalInformation,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName === "-- --" ? null : data.submitterName,
      origin: "OneMAC",
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;
