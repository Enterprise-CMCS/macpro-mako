import { z } from "zod";
import {
  AttachmentRecipe,
  zAdditionalInfo,
  zAttachmentOptional,
  zAttachmentRequired,
} from "@/utils";
import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";

export const chipWithdrawPackageSchema = z.object({
  additionalInformation: zAdditionalInfo.optional(),
  attachments: z.object({
    officialWithdrawalLetter: zAttachmentRequired({ min: 1 }),
  }),
});
export const chipWithdrawPackageAttachments: AttachmentRecipe<
  z.infer<typeof chipWithdrawPackageSchema>
>[] = [
  {
    name: "officialWithdrawalLetter",
    label: "Official Withdrawal Letter",
    required: true,
  },
];
export const chipWithdrawPackageContent: FormContentHydrator = (document) => ({
  title: "Withdraw CHIP SPA Package",
  description:
    "Complete this form to withdraw a package. Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email.",
  preSubmitNotice:
    "Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email.",
  attachmentsInstruction:
    "Official withdrawal letters are required and must be on state letterhead signed by the State Medicaid Director or CHIP Director.",
  additionalInfoInstruction: "Explain your need for withdrawal.",
  successBanner: {
    header: "Package withdrawn",
    body: `The package ${document.id} has been withdrawn.`,
  },
});

export const defaultWithdrawPackageSchema = z
  .object({
    additionalInformation: zAdditionalInfo.optional(),
    attachments: z.object({
      supportingDocumentation: zAttachmentOptional,
    }),
  })
  .superRefine((data, ctx) => {
    if (
      !data.attachments.supportingDocumentation?.length &&
      data.additionalInformation === undefined
    ) {
      ctx.addIssue({
        message: "An Attachment or Additional Information is required.",
        code: z.ZodIssueCode.custom,
        fatal: true,
      });
      // Zod says this is to appease types
      // https://github.com/colinhacks/zod?tab=readme-ov-file#type-refinements
      return z.NEVER;
    }
  });
export const defaultWithdrawPackageAttachments: AttachmentRecipe<
  z.infer<typeof defaultWithdrawPackageSchema>
>[] = [
  {
    name: "supportingDocumentation",
    label: "Supporting Documentation",
    required: false,
  },
];
export const defaultWithdrawPackageContent: FormContentHydrator = (
  document,
) => ({
  title: `Withdraw ${document.authority} Package`,
  description:
    "Complete this form to withdraw a package. Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email.",
  preSubmitNotice:
    "Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email.",
  attachmentsInstruction:
    "Upload your supporting documentation for withdrawal or explain your need for withdrawal in the Additional Information section.",
  additionalInfoInstruction:
    "Explain your need for withdrawal, or upload supporting documentation.",
  confirmationModal: {
    header: "Withdraw Package?",
    body: `The package ${document.id} will be withdrawn.`,
    acceptButtonText: "Yes, withdraw package",
    cancelButtonText: "Return to form",
  },
  successBanner: {
    header: "Package withdrawn",
    body: `The package ${document.id} has been withdrawn.`,
  },
});
