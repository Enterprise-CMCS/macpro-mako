import { z } from "zod";
import { s3ParseUrl } from "shared-utils/s3-url-parser";

const onemacAttachmentSchema = z.object({
  s3Key: z.string().nullish(),
  filename: z.string(),
  title: z.string(),
  contentType: z.string().nullish(),
  url: z.string().url().nullish(),
  bucket: z.string().nullish(),
  key: z.string().nullish(),
  uploadDate: z.number().nullish(),
});
export type OnemacAttachmentSchema = z.infer<typeof onemacAttachmentSchema>;

export const raiSchema = z.object({
  id: z.string(),
  requestedDate: z.number(),
  responseDate: z.number().nullish(),
  withdrawnDate: z.number().nullish(),
  attachments: z.array(onemacAttachmentSchema).nullish(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
});
export type RaiSchema = z.infer<typeof raiSchema>;

export interface RaiData {
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
}

export const transformRaiIssue = (id: string) => {
  return raiSchema.transform((data) => ({
    id,
    rais: {
      [data.requestedDate]: {
        request: {
          attachments:
            data.attachments?.map((attachment) => {
              return handleAttachment(attachment);
            }) ?? null,
          additionalInformation: data.additionalInformation,
          submitterName: data.submitterName,
          submitterEmail: data.submitterEmail,
        },
      },
    },
  }));
};
export type RaiIssueTransform = z.infer<ReturnType<typeof transformRaiIssue>>;

export const transformRaiResponse = (id: string) => {
  return raiSchema.transform((data) => ({
    id,
    rais: {
      [data.requestedDate]: {
        response: {
          attachments:
            data.attachments?.map((attachment) => {
              return handleAttachment(attachment);
            }) ?? null,
          additionalInformation: data.additionalInformation,
          submitterName: data.submitterName,
          submitterEmail: data.submitterEmail,
        },
      },
    },
  }));
};
export type RaiResponseTransform = z.infer<
  ReturnType<typeof transformRaiResponse>
>;

export const onemacSchema = z.object({
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
      origin: "oneMAC",
      rais: {} as RaiData,
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

export type OneMacSink = z.infer<typeof onemacSchema>;
export type OneMacTransform = z.infer<ReturnType<typeof transformOnemac>>;
export type OneMacRecordsToDelete = Omit<
  {
    [Property in keyof OneMacTransform]: null;
  },
  "id" | "rais"
> & { id: string };

function handleAttachment(attachment: OnemacAttachmentSchema) {
  let bucket = "";
  let key = "";
  let uploadDate = 0;
  if ("bucket" in attachment) {
    bucket = attachment.bucket as string;
  }
  if ("key" in attachment) {
    key = attachment.key as string;
  }
  if ("uploadDate" in attachment) {
    uploadDate = attachment.uploadDate as number;
  }
  if (bucket == "") {
    const parsedUrl = s3ParseUrl(attachment.url || "");
    if (!parsedUrl) return null;
    bucket = parsedUrl.bucket;
    key = parsedUrl.key;
    uploadDate = parseInt(attachment.s3Key?.split("/")[0] || "0");
  }

  return {
    title: attachment.title,
    filename: attachment.filename,
    uploadDate,
    bucket,
    key,
  };
}
