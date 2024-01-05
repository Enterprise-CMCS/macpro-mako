import { z } from "zod";
import { onemacAttachmentSchema, handleAttachment } from "./attachments";

// This is the event schema for ne submissions from our system
export const onemacSchema = z.object({
  authority: z.string(),
  origin: z.string(),
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

export type OneMac = z.infer<typeof onemacSchema>;

export const transformOnemac = (id: string) => {
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
export type OnemacTransform = z.infer<ReturnType<typeof transformOnemac>>;

export type OnemacRecordsToDelete = Omit<
  {
    [Property in keyof OnemacTransform]: null;
  },
  "id" | "rais"
> & { id: string };
