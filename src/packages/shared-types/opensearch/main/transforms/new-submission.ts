import { onemacSchema } from "../../..";

export const transform = (id: string) => {
  return onemacSchema.transform((data) => {
    // TODO: APP-K Parent Id
    const transformedData = {
      id,
      attachments: data.attachments,
      parentId: data.parentId,
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
