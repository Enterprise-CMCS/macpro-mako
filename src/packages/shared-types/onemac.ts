import { z } from "zod";
import s3parse from "s3-url-parser";

export const onemacSchema = z.object({
  additionalInformation: z.string().optional(),
  componentType: z.string(),
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

// eventData.attachments = record.attachments || null;
//       if (record.attachments && Array.isArray(record.attachments)) {
//         eventData.attachments = record.attachments.map((attachment) => {
//           const uploadDate = parseInt(attachment.s3Key.split("/")[0]);
//           delete attachment.s3Key; // Once we have the date, this value is useless to us.  It's not the actual key
//           const { bucket, key } = s3ParseUrl(attachment.url);
//           return {
//             ...attachment,
//             uploadDate,
//             bucket,
//             key,
//           };
//         });
//       }

export const transformOnemac = (id: string) => {
  return onemacSchema.transform((data) => ({
    attachments:
      data.attachments?.map((attachment) => {
        const uploadDate = parseInt(attachment.s3Key.split("/")[0]);
        const { bucket, key } = s3parse(attachment.url) as {
          bucket: string;
          key: string;
        };

        return {
          ...attachment,
          uploadDate,
          bucket,
          key,
        };
      }) ?? [],
    additionalInformation: data.additionalInformation,
    submitterName: data.submitterName,
    submitterEmail: data.submitterEmail,
    submissionOrigin: "Onemac",
    id,
  }));
};

export type OneMacSink = z.infer<typeof onemacSchema>;
export type OneMacTransform = z.infer<ReturnType<typeof transformOnemac>>;
