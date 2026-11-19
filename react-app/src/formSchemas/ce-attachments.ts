import { attachmentSchema, CE_ATTACHMENT_LABELS } from "shared-types";
import { z } from "zod";

export const UNAUTHORIZED_STATE_MESSAGE =
  "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.";

export const DUPLICATE_SUBMISSION_ID_MESSAGE =
  "According to our records, this Submission ID already exists. Please check the Submission ID and try entering it again.";

export const CE_ATTACHMENT_REQUIRED_MESSAGE =
  "At least one file is required across Template and Other Supporting Documentation.";

/** Optional per slot so the form can require one file across both slots. */
export const ceFormAttachmentSlotSchema = (label: string) =>
  z.object({
    label: z.string().default(label),
    files: z.array(attachmentSchema).optional(),
  });

export const ceFormAttachmentsSchema = z.object({
  ceTemplate: ceFormAttachmentSlotSchema(CE_ATTACHMENT_LABELS.ceTemplate),
  other: ceFormAttachmentSlotSchema(CE_ATTACHMENT_LABELS.other),
});

type CeFormCrossFields = {
  id?: string;
  state?: string;
  attachments?: {
    ceTemplate?: { files?: { length: number } | null };
    other?: { files?: { length: number } | null };
  };
};

/** Apply the shared CEntra cross-field checks, plus a visible file-slot error. */
export function applyCeFormRefinement(
  value: CeFormCrossFields,
  ctx: z.RefinementCtx,
  refine: (
    value: {
      id: string;
      state: string;
      attachments: {
        ceTemplate: { files?: { length: number } | null };
        other: { files?: { length: number } | null };
      };
    },
    ctx: z.RefinementCtx,
  ) => void,
): void {
  refine(
    {
      id: value.id ?? "",
      state: value.state ?? "",
      attachments: {
        ceTemplate: { files: value.attachments?.ceTemplate?.files ?? [] },
        other: { files: value.attachments?.other?.files ?? [] },
      },
    },
    ctx,
  );

  const templateFiles = value.attachments?.ceTemplate?.files?.length ?? 0;
  const otherFiles = value.attachments?.other?.files?.length ?? 0;
  if (templateFiles + otherFiles < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: CE_ATTACHMENT_REQUIRED_MESSAGE,
      path: ["attachments", "ceTemplate", "files"],
    });
  }
}
