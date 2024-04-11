import { z } from "zod";
import {
  AttachmentRecipe,
  zAdditionalInfo,
  zAttachmentOptional,
} from "@/utils";
import { FormContentHydrator } from "@/features/package-actions/lib/content";

export const defaultWithdrawRaiSchema = z.object({
  additionalInformation: zAdditionalInfo,
  attachments: z.object({
    supportingDocumentation: zAttachmentOptional,
  }),
});
export const defaultWithdrawRaiAttachments: AttachmentRecipe<
  z.infer<typeof defaultWithdrawRaiSchema>
>[] = [
  {
    name: "supportingDocumentation",
    label: "Supporting Documentation",
    required: false,
  },
];
export const defaultWithdrawRaiContent: FormContentHydrator = (document) => ({
  title: `${document.authority} Withdraw Formal RAI Response Details`,
  description:
    "Complete this form to withdraw the Formal RAI response. Once complete, you and CMS will receive an email confirmation.",
  preSubmitNotice:
    "Once complete, you and CMS will receive an email confirmation.",
  confirmationModal: {
    header: "Withdraw RAI response?",
    body: `The RAI response for ${document.id} will be withdrawn, and CMS will be notified.`,
    acceptButtonText: "Yes, withdraw response",
    cancelButtonText: "Cancel",
  },
  successBanner: {
    header: "RAI response withdrawn",
    body: `The RAI response for ${document.id} has been withdrawn. CMS may follow up if additional information is needed.`,
  },
});
