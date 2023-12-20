import { z } from "zod";
import { onemacAttachmentSchema, handleAttachment } from "./attachments";

// This is the event schema we can expect streaming from legacy onemac.
// It should be used by the sink to safe parse and then transform before publishing to opensearch.
export const onemacLegacySchema = z.object({
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(onemacAttachmentSchema).nullish(),
  raiWithdrawEnabled: z.boolean().default(false),
  raiResponses: z
    .array(
      z.object({
        additionalInformation: z.string().nullable().default(null),
        submissionTimestamp: z.number(),
        attachments: z.array(onemacAttachmentSchema).nullish(),
      })
    )
    .nullish(),
});
export type OnemacLegacy = z.infer<typeof onemacLegacySchema>;

export const transformOnemacLegacy = (id: string) => {
  return onemacLegacySchema.transform((data) => {
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
      origin: "oneMAC",
      rais: {} as {
        [key: number]: {
          requestedDate?: string;
          responseDate?: string;
          withdrawnDate?: string;
          response?: {
            additionalInformation: string;
            submitterName: string | null;
            submitterEmail: string | null;
            attachments: any[] | null; // You might want to specify the type of attachments
          };
          request?: {
            additionalInformation: string;
            submitterName: string | null;
            submitterEmail: string | null;
            attachments: any[] | null; // You might want to specify the type of attachments
          };
        };
      },
    };
    if (data.raiResponses) {
      data.raiResponses.forEach((raiResponse, index) => {
        // We create an rai keyed off the index, because we don't know which rai it was in response to.  Best we can do.
        transformedData["rais"][index] = {
          responseDate: raiResponse.submissionTimestamp.toString(),
          response: {
            additionalInformation: raiResponse.additionalInformation || "",
            submitterName: null,
            submitterEmail: null,
            attachments:
              raiResponse.attachments?.map((attachment) => {
                return handleAttachment(attachment);
              }) ?? null,
          },
        };
      });
    }
    return transformedData;
  });
};
export type OnemacLegacyTransform = z.infer<
  ReturnType<typeof transformOnemacLegacy>
>;

export type OnemacLegacyRecordsToDelete = Omit<
  {
    [Property in keyof OnemacLegacyTransform]: null;
  },
  "id" | "rais"
> & { id: string };
