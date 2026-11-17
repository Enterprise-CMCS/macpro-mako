import { z } from "zod";

import { attachmentSchema } from "../attachments";
import {
  CE_ADDITIONAL_INFORMATION_MAX_LENGTH,
  CE_ATTACHMENT_LABELS,
  CE_HARDSHIP_KIND_CODES,
  CE_PACKAGE_ID_FORMAT_MESSAGE,
  CE_PACKAGE_ID_REGEX,
  isKnownStateCode,
} from "../centra";

export const ceHardshipKindSchema = z.enum(CE_HARDSHIP_KIND_CODES);

export const cePackageIdSchema = z
  .string()
  .min(1, { message: "Required" })
  .regex(CE_PACKAGE_ID_REGEX, { message: CE_PACKAGE_ID_FORMAT_MESSAGE })
  .refine((id) => isKnownStateCode(id.slice(0, 2)), {
    message: "ID must start with a known state code.",
  });

export const ceStateSchema = z
  .string()
  .min(1, { message: "Required" })
  .refine((state) => isKnownStateCode(state), {
    message: "State must be a known state code.",
  });

export const ceAttachmentSlotSchema = (label: string) =>
  z.object({
    label: z.string().default(label),
    files: z.array(attachmentSchema).default([]),
  });

export const ceAttachmentsSchema = z.object({
  ceTemplate: ceAttachmentSlotSchema(CE_ATTACHMENT_LABELS.ceTemplate),
  other: ceAttachmentSlotSchema(CE_ATTACHMENT_LABELS.other),
});

/** Required on submit; whitespace-only is rejected. */
export const ceAdditionalInformationSchema = z
  .string()
  .trim()
  .min(1, { message: "Required" })
  .max(CE_ADDITIONAL_INFORMATION_MAX_LENGTH, {
    message: "Additional Information must be at most 4,000 characters.",
  });

export const ceSubsequentInformationSchema = ceAdditionalInformationSchema;

export interface CeSubmissionCrossFields {
  id?: string;
  state?: string;
  attachments?: {
    ceTemplate?: { files?: { length: number } | null };
    other?: { files?: { length: number } | null };
  };
}

/** At least one file across the two slots, and `state` matches the ID prefix. */
export function refineCeSubmission(value: CeSubmissionCrossFields, ctx: z.RefinementCtx): void {
  const id = value.id ?? "";
  const state = value.state ?? "";
  if (id.slice(0, 2) !== state) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "State must match the ID prefix.",
      path: ["state"],
    });
  }

  const templateFiles = value.attachments?.ceTemplate?.files?.length ?? 0;
  const otherFiles = value.attachments?.other?.files?.length ?? 0;
  if (templateFiles + otherFiles < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one file is required across Template and Other Supporting Documentation.",
      path: ["attachments"],
    });
  }
}
