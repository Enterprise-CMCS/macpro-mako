import { onemacSchema, handleAttachment } from "./../../../../shared-types";

export const newSubmission = (id: string) => {
  return onemacSchema.transform((data) => {
    const transformedData = {
      id,
      attachments:
        data.attachments?.map((attachment) => {
          return handleAttachment(attachment);
        }) ?? null,
      raiWithdrawEnabled: data.raiWithdrawEnabled,
      additionalInformation: data.additionalInformation,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName === "-- --" ? null : data.submitterName,
      origin: "OneMAC",
    };
    return transformedData;
  });
};
