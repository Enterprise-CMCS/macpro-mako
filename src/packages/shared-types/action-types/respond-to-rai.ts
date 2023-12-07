import { z } from "zod";
import { onemacAttachmentSchema, handleAttachment } from "../attachments";

export const respondToRaiSchema = z.object({
  id: z.string(),
  requestedDate: z.number(),
  responseDate: z.number(),
  attachments: z.array(onemacAttachmentSchema).nullish(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
});
export type RespondToRai = z.infer<typeof respondToRaiSchema>;

export const transformRaiResponse = (id: string) => {
  return respondToRaiSchema.transform((data) => ({
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
