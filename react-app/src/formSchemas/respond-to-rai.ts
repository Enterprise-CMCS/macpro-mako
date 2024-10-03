// import { z } from "zod";
// import { attachmentSchema } from "shared-types";
import { events } from "shared-types/events";
// import { zAdditionalInfo, zAttachmentOptional } from "@/utils";
// export const defaultWithdrawRaiSchema = z.object({
//   additionalInformation: zAdditionalInfo,
//   attachments: z.object({
//     supportingDocumentation: zAttachmentOptional,
//   }),
// });

export const formSchema = events["respond-to-rai"].baseSchema;

// export const raiWithdrawSchema = z.object({
//   id: z.string(),
//   authority: z.string(),
//   origin: z.string(),
//   requestedDate: z.number(),
//   withdrawnDate: z.number(),
//   attachments: z.array(attachmentSchema).nullish(),
//   additionalInformation: z.string().nullable().default(null),
//   submitterName: z.string(),
//   submitterEmail: z.string(),
//   timestamp: z.number().optional(),
// });