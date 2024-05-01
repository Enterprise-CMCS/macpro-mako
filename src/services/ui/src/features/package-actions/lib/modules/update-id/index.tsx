import { z } from "zod";
import { zUpdateIdSchema } from "@/utils";
import { ReactElement } from "react";
import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import {
  ActionFormDescription,
  AdditionalInfoSection,
  PackageSection,
} from "@/components";
import { NewIdField } from "@/features/package-actions/lib/modules/update-id/legacy-components";
import { CheckStatusFunction } from "@/utils/Poller/seaStatusPoller";

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
  <ActionFormDescription key={"section-desc"}>
    Once you submit this form, the ID of the existing package will be updated in
    SEATool and OneMAC.{" "}
    <strong>
      If you leave this page, you will lose your progress on this form.
    </strong>
  </ActionFormDescription>,
  <PackageSection key={"section-packageinfo"} />,
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

export const idUpdated: CheckStatusFunction = (_checks) => true;
