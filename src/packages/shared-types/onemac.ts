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

export const onemacSchema = z.object({
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z.array(onemacAttachmentSchema).nullish(),
  raiResponses: z
    .array(
      z.object({
        additionalInformation: z.string().nullable().default(null),
        submissionTimestamp: z.number(),
        attachments: z.array(onemacAttachmentSchema),
      })
    )
    .nullish(),
});

export const transformOnemac = (id: string) => {
  return onemacSchema.transform((data) => ({
    id,
    attachments:
      data.attachments?.map((attachment) => {
        // this is a legacy onemac attachment
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
      }) ?? null,
    raiResponses:
      data.raiResponses?.map((response) => {
        return {
          additionalInformation: response.additionalInformation,
          submissionTimestamp: response.submissionTimestamp,
          attachments:
            response.attachments?.map((attachment) => {
              const uploadDate = parseInt(
                attachment.s3Key?.split("/")[0] || "0"
              );
              const parsedUrl = s3ParseUrl(attachment.url || "");
              if (!parsedUrl) return null;
              const { bucket, key } = parsedUrl;

              return {
                ...attachment,
                uploadDate,
                bucket,
                key,
              };
            }) ?? null,
        };
      }) ?? null,
    additionalInformation: data.additionalInformation,
    submitterEmail: data.submitterEmail,
    submitterName: data.submitterName === "-- --" ? null : data.submitterName,
    origin: "oneMAC",
  }));
};

export type OneMacSink = z.infer<typeof onemacSchema>;
export type OneMacTransform = z.infer<ReturnType<typeof transformOnemac>>;
export type OneMacRecordsToDelete = Omit<
  {
    [Property in keyof OneMacTransform]: undefined;
  },
  "id"
> & { id: string };
