import { z } from "zod";
import { s3ParseUrl } from "shared-utils/s3-url-parser";

const onemacAttachmentSchema = z.object({
  s3Key: z.string(),
  filename: z.string(),
  title: z.string(),
  contentType: z.string(),
  url: z.string().url(),
});

const microAttachmentSchema = z.object({
  bucket: z.string(),
  key: z.string(),
  filename: z.string(),
  title: z.string(),
  uploadDate: z.number(),
});

export const onemacSchema = z.object({
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z
    .array(onemacAttachmentSchema)
    .or(z.array(microAttachmentSchema))
    .nullish(),
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
        if ("uploadDate" in attachment) {
          // this is a micro attachment
          return {
            bucket: attachment.bucket,
            key: attachment.key,
            filename: attachment.filename,
            title: attachment.title,
            uploadDate: attachment.uploadDate,
          };
        } else {
          // this is a legacy onemac attachment
          const uploadDate = parseInt(attachment.s3Key.split("/")[0]);
          const parsedUrl = s3ParseUrl(attachment.url);
          if (!parsedUrl) return null;
          const { bucket, key } = parsedUrl;

          return {
            ...attachment,
            uploadDate,
            bucket,
            key,
          };
        }
      }) ?? null,
    raiResponses:
      data.raiResponses?.map((response) => {
        return {
          additionalInformation: response.additionalInformation,
          submissionTimestamp: response.submissionTimestamp,
          attachments:
            response.attachments?.map((attachment) => {
              const uploadDate = parseInt(attachment.s3Key.split("/")[0]);
              const parsedUrl = s3ParseUrl(attachment.url);
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
