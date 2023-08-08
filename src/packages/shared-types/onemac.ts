import { z } from "zod";

export const onemacSchema = z.object({
  additionalInformation: z.string().optional(),
  componentType: z.string(),
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
    .optional(),
});

export const transformOnemac = (id: string) => {
  return onemacSchema.transform((data) => ({
    filename: data.attachments?.[0].filename,
  }));
};

export type OneMacSink = z.infer<typeof onemacSchema>;
export type OneMacTransform = z.infer<ReturnType<typeof transformOnemac>>;
