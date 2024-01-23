import { onemacLegacySchema, handleLegacyAttachment } from "../../..";

export const transform = (id: string) => {
  return onemacLegacySchema.transform((data) => {
    const transformedData = {
      id,
      attachments: data.attachments?.map(handleLegacyAttachment) ?? null,
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
