import { z } from "zod";
import { zUpdateIdSchema } from "@/utils";
import { ReactElement } from "react";
import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { ActionFormDescription, AdditionalInfoSection } from "@/components";
import { NewIdField } from "@/features/package-actions/lib/modules/update-id/legacy-components";
import { CheckDocumentFunction } from "@/utils/Poller/documentPoller";

export const defaultUpdateIdSchema = z
  .object({
    id: z.string(),
    additionalInformation: z.string().refine((data) => data.trim().length > 0, {
      message: "Additional information cannot be empty or just spaces.",
    }),
    newId: zUpdateIdSchema,
  })
  .superRefine((data, ctx) => {
    if (data.id.split("-")[0] !== data.newId.split("-")[0]) {
      ctx.addIssue({
        message: "New IDs must have the same state code as the old ID.",
        code: z.ZodIssueCode.custom,
        fatal: true,
        path: ["newId"],
      });
    }
    return z.NEVER;
  });
export const defaultUpdateIdFields: ReactElement[] = [
  <ActionFormDescription boldReminder key={"section-desc"}>
    Once you submit this form, the ID of the existing package will be updated in
    SEATool and OneMAC.
  </ActionFormDescription>,
  <NewIdField key={"field-newid"} />,
  <AdditionalInfoSection
    key={"field-addlinfo"}
    required
    instruction={"Please explain the reason for updating this ID."}
  />,
];
export const defaultUpdateIdContent: FormContentHydrator = (document) => ({
  title: "Update ID",
  successBanner: {
    header: "ID Update submitted",
    body: `The ID Update for ${document.id} has been submitted.`,
  },
  preSubmitNotice:
    "Once you submit this form, the ID of the existing package will be updated in SEATool and OneMAC.",
});

export const idUpdated: CheckDocumentFunction = (checks) =>
  checks.recordExists && checks.hasSubmissionDate;
