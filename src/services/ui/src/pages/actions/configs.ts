import { AttachmentRecipe } from "@/lib";
import {
  zIssueRaiFormSchema,
  zRespondToChipRaiFormSchema,
  zRespondToMedicaidRaiFormSchema,
  zWithdrawPackageFormSchema,
  zWithdrawRaiFormSchema,
} from "@/pages/actions/schemas";
import { ZodObject } from "zod";

export type FormConfig = {
  readonly title: string;
  readonly schema: ZodObject<any>;
  readonly attachments: AttachmentRecipe[];
  /* Use if your action has additional/complex rules. (ex: WithdrawPackage
   * requires _either_ an attachment _or_ additionalInfo, and Zod doesn't support
   * this case.)
   *
   * Submit Rules should throw an error if a condition is not met. */
  readonly submitRules?: ((data: object) => void)[];
};

export const fcIssueRai: FormConfig = {
  title: "Formal RAI Details",
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
  schema: zWithdrawPackageFormSchema,
  attachments: [
    {
      name: "supportingDocumentation",
      label: "Supporting Documentation",
      required: false,
    },
  ],
};
