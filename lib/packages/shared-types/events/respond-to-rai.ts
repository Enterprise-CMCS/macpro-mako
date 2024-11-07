import { z } from "zod";
<<<<<<< HEAD
import { attachmentSchema } from "../attachments";
import { notificationMetadataSchema } from "../notification-metadata";
=======
import { attachmentArraySchema, attachmentArraySchemaOptional } from "../attachments";
>>>>>>> 96c494f1 (feat(new-sub-email: Add email notifications for new-submission events (#818))

export const respondToRaiBaseSchema = z.object({
  id: z.string(),
  authority: z.string(),
  origin: z.string(),
  requestedDate: z.number(),
  responseDate: z.number(),
  attachments: z.object({
    cmsForm179: z.object({
      label: z.string().default("CMS Form 179"),
      files: attachmentArraySchemaOptional(),
    }),
    spaPages: z.object({
      label: z.string().default("SPA Pages"),
      files: attachmentArraySchemaOptional(),
    }),
    other: z.object({
      label: z.string().default("Other"),
      files: attachmentArraySchemaOptional(),
    }),
  }),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
  proposedEffectiveDate: z.number().optional(),
  submittedDate: z.number().optional(),
  timestamp: z.number().optional(),
});
<<<<<<< HEAD
export type RaiResponse = z.infer<typeof raiResponseSchema>;
=======
export type RaiResponse = z.infer<typeof respondToRaiBaseSchema>;

export const medicaidSpaAttachments = z.object({
  raiResponseLetter: z.object({
    files: attachmentArraySchema(),
    label: z.string().default("RAI Response Letter"),
  }),
  other: z.object({
    files: attachmentArraySchemaOptional(),
    label: z.string().default("Other"),
  }),
});

export const waiverAttachments = z.object({
  raiResponseLetterWaiver: z.object({
    files: attachmentArraySchema(),
    label: z.string().default("Waiver RAI Response Letter"),
  }),
  other: z.object({
    files: attachmentArraySchemaOptional(),
    label: z.string().default("Other"),
  }),
});

export const chipSpaAttachments = z.object({
  revisedAmendedStatePlanLanguage: z.object({
    files: attachmentArraySchema(),
    label: z.string().default("Revised Amended State Plan Language"),
  }),
  officialRAIResponse: z.object({
    files: attachmentArraySchema(),
    label: z.string().default("Official RAI Response"),
  }),
  budgetDocuments: z.object({
    files: attachmentArraySchemaOptional(),
    label: z.string().default("Budget Documents"),
  }),
  publicNotice: z.object({
    files: attachmentArraySchemaOptional(),
    label: z.string().default("Public Notice"),
  }),
  tribalConsultation: z.object({
    files: attachmentArraySchemaOptional(),
    label: z.string().default("Tribal Consultation"),
  }),
  other: z.object({
    files: attachmentArraySchemaOptional(),
    label: z.string().default("Other"),
  }),
});

export const baseSchema = z.object({
  event: z.literal("respond-to-rai").default("respond-to-rai"),
  additionalInformation: z.string().max(4000).nullable().default(null),
  attachments: chipSpaAttachments.or(waiverAttachments).or(medicaidSpaAttachments),
  id: z.string(),
});

export const schema = baseSchema.extend({
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});
>>>>>>> 96c494f1 (feat(new-sub-email: Add email notifications for new-submission events (#818))
