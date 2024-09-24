import { z } from "zod";
import {
  zAttachmentOptional,
  zAttachmentRequired,
  zExtensionOriginalWaiverNumberSchema,
  zExtensionWaiverNumberSchema,
  zodAlwaysRefine,
} from "@/utils/zod";
import { getItem } from "@/api";
import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { ReactElement } from "react";
import {
  ActionFormDescription,
  AdditionalInfoSection,
  AttachmentsSection,
} from "@/components";
import { CheckDocumentFunction } from "@/utils/Poller/documentPoller";

export const defaultTempExtSchema = zodAlwaysRefine(
  z.object({
    id: zExtensionWaiverNumberSchema,
    authority: z.string(),
    seaActionType: z.string().default("Extend"),
    originalWaiverNumber: zExtensionOriginalWaiverNumberSchema,
    additionalInformation: z.string().optional().default(""),
    attachments: z.object({
      waiverExtensionRequest: zAttachmentRequired({ min: 1 }),
      other: zAttachmentOptional,
    }),
  }),
).superRefine(async (data, ctx) => {
  console.log("hello");
  // Check that the authorities match
  try {
    const originalWaiverData = await getItem(data.originalWaiverNumber);
    if (originalWaiverData._source.authority !== data.authority) {
      ctx.addIssue({
        message:
          "The selected Temporary Extension Type does not match the Approved Initial or Renewal Waiver's type.",
        code: z.ZodIssueCode.custom,
        fatal: true,
        path: ["authority"],
      });
    }

    // Check that the original waiver and temp extension have the same id up to the last period
    const originalWaiverNumberPrefix = data.originalWaiverNumber.substring(
      0,
      data.originalWaiverNumber.lastIndexOf("."),
    );
    const idPrefix = data.id.substring(0, data.id.lastIndexOf("."));
    if (originalWaiverNumberPrefix !== idPrefix) {
      ctx.addIssue({
        message:
          "The Approved Initial or Renewal Waiver Number and the Temporary Extension Request Number must be identical until the last period.",
        code: z.ZodIssueCode.custom,
        fatal: true,
        path: ["id"],
      });
    }
    return z.never;
  } catch (error) {
    // If we've failed here, the item does not exist, and the originalWaiverNumberSchema validation will throw the correct errors.
    console.error(error);
    return z.never;
  }
});
export const defaultTempExtFields: ReactElement[] = [
  <ActionFormDescription boldReminder key={"te-content-description"}>
    Once you submit this form, a confirmation email is sent to you and to CMS.
    CMS will use this content to review your package, and you will not be able
    to edit this form. If CMS needs any additional information, they will follow
    up by email.
  </ActionFormDescription>,
  <AttachmentsSection
    key={"field-attachments"}
    faqAttLink="/faq/temporary-extensions-b-attachments"
    attachments={[
      {
        name: "waiverExtensionRequest",
        required: true,
      },
      {
        name: "other",
        required: false,
      },
    ]}
  />,
  <AdditionalInfoSection
    key={"field-addlinfo"}
    instruction={"Add anything else that you would like to share with CMS."}
  />,
];
export const defaultTempExtContent: FormContentHydrator = () => ({
  title: "Temporary Extension Request Details",
  preSubmitNotice:
    "Once you submit this form, a confirmation email is sent to you and to CMS. CMS will use this content to review your package, and you will not be able to edit this form. If CMS needs any additional information, they will follow up by email.",
  successBanner: {
    header: "Temporary extension request submitted",
    body: "Your submission has been received.",
  },
});

export const temporaryExtensionRequested: CheckDocumentFunction = (checks) =>
  checks.recordExists;
