import { AttachmentRecipe } from "@/lib";
import {
  zIssueRaiFormSchema,
  zRespondToChipRaiFormSchema,
  zRespondToMedicaidRaiFormSchema,
  zWithdrawPackageFormSchema,
  zWithdrawRaiFormSchema,
} from "@/pages/actions/schemas";
import { ZodObject } from "zod";
import { ReactElement } from "react";

export type FormConfig = {
  readonly title: string;
  readonly description: ReactElement;
  readonly schema: ZodObject<any>;
  readonly attachments: AttachmentRecipe[];
  /* Use if your action has additional/complex rules. (ex: WithdrawPackage
   * requires _either_ an attachment _or_ additionalInfo, and Zod doesn't support
   * this case.)
   *
   * Submit Rules should throw an error if a condition is not met. */
  readonly submitRules?: ((data: Record<string, any>) => void)[];
};

export const fcIssueRai: FormConfig = {
  title: "Formal RAI Details",
  description: (
    <p className="font-light mb-6 max-w-4xl">
      Issuance of a Formal RAI in OneMAC will create a Formal RAI email sent to
      the State. This will also create a section in the package details summary
      for you and the State to have record. Please attach the Formal RAI Letter
      along with any additional information or comments in the provided text
      box. Once you submit this form, a confirmation email is sent to you and to
      the State.{" "}
      <strong className="bold">
        If you leave this page, you will lose your progress on this form.
      </strong>
    </p>
  ),
  schema: zIssueRaiFormSchema,
  attachments: [
    {
      name: "formalRaiLetter",
      label: "Formal RAI Letter",
      required: true,
    },
    {
      name: "other",
      label: "Other",
      required: false,
    },
  ],
};

export const fcRespondToChipRai: FormConfig = {
  title: "CHIP SPA Formal RAI Details",
  description: (
    <p className="font-light mb-6 max-w-4xl">
      Once you submit this form, a confirmation email is sent to you and to CMS.
      CMS will use this content to review your package, and you will not be able
      to edit this form. If CMS needs any additional information, they will
      follow up by email.{" "}
      <strong className="bold">
        If you leave this page, you will lose your progress on this form.
      </strong>
    </p>
  ),
  schema: zRespondToChipRaiFormSchema,
  attachments: [
    {
      name: "revisedAmendedStatePlanLanguage",
      label: "Revised Amended State Plan Language",
      required: true,
    },
    {
      name: "officialRaiResponse",
      label: "Official Rai Response",
      required: true,
    },
    {
      name: "budgetDocuments",
      label: "Budget Documents",
      required: false,
    },
    {
      name: "publicNotice",
      label: "Public Notice",
      required: false,
    },
    {
      name: "tribalConsultation",
      label: "Tribal Consultation",
      required: false,
    },
    {
      name: "other",
      label: "Other",
      required: false,
    },
  ],
};

export const fcRespondToMedicaidRai: FormConfig = {
  title: "Medicaid SPA Formal RAI Details",
  description: (
    <p className="font-light mb-6 max-w-4xl">
      Once you submit this form, a confirmation email is sent to you and to CMS.
      CMS will use this content to review your package, and you will not be able
      to edit this form. If CMS needs any additional information, they will
      follow up by email.{" "}
      <strong className="bold">
        If you leave this page, you will lose your progress on this form.
      </strong>
    </p>
  ),
  schema: zRespondToMedicaidRaiFormSchema,
  attachments: [
    {
      name: "raiResponseLetter",
      label: "RAI Response Letter",
      required: true,
    },
    {
      name: "other",
      label: "Other",
      required: false,
    },
  ],
};

export const fcWithdrawRai: FormConfig = {
  title: "Withdraw Formal RAI Response Details",
  description: (
    <p className="font-light mb-6 max-w-4xl">
      Complete this form to withdraw the Formal RAI response. Once complete, you
      and CMS will receive an email confirmation.
    </p>
  ),
  schema: zWithdrawRaiFormSchema,
  attachments: [
    {
      name: "supportingDocumentation",
      label: "Supporting Documentation",
      required: false,
    },
  ],
};

export const fcWithdrawPackage: FormConfig = {
  title: "Withdraw Medicaid SPA Package",
  description: (
    <p>
      Complete this form to withdraw a package. Once complete, you will not be
      able to resubmit this package. CMS will be notified and will use this
      content to review your request. If CMS needs any additional information,
      they will follow up by email.
    </p>
  ),
  schema: zWithdrawPackageFormSchema,
  attachments: [
    {
      name: "supportingDocumentation",
      label: "Supporting Documentation",
      required: false,
    },
  ],
  submitRules: [
    // Either Additional Info OR an attachment is required
    (data) =>
      data?.additionalInfo.length ||
      data.attachments.supportingDocumentation.length,
  ],
};
