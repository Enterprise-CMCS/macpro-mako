import { z } from "zod";
import { s3ParseUrl } from "shared-utils/s3-url-parser";

export const onemacSchema = z.object({
  additionalInformation: z.string().optional(),
  submitterName: z.string(),
  submitterEmail: z.string(),
  attachments: z
    .array(
      z.object({
        s3Key: z.string(),
        filename: z.string(),
        title: z.string(),
        contentType: z.string(),
        url: z.string().url(),
      })
    )
    .nullish(),
});

export const transformOnemac = (id: string) => {
  return onemacSchema.transform((data) => ({
    id,
    attachments:
      data.attachments?.map((attachment) => {
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
    additionalInformation: data.additionalInformation,
    submitterEmail: data.submitterEmail,
    submitterName: data.submitterName,
  }));
};

export type OneMacSink = z.infer<typeof onemacSchema>;
export type OneMacTransform = z.infer<ReturnType<typeof transformOnemac>>;
