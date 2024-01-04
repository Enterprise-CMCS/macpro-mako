import { AttachmentRecipe } from "@/lib";
import {
  zIssueRaiFormSchema,
  zRespondToChipRaiFormSchema,
  zRespondToMedicaidRaiFormSchema,
  zWithdrawPackageFormSchema,
  zWithdrawRaiFormSchema,
} from "@/pages/actions/schemas";

export type FormConfig<S extends Record<string, any>> = {
  readonly schema: S;
  readonly attachments: AttachmentRecipe<S>[];
  /* Use if your action has additional/complex rules. (ex: WithdrawPackage
   * requires _either_ an attachment _or_ additionalInfo, and Zod doesn't support
   * this case.)
   *
   * Submit Rules should throw an error if a condition is not met. */
  readonly submitRules?: ((data: S) => void)[];
};

const fcIssueRai: FormConfig<typeof zIssueRaiFormSchema> = {
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

const fcRespondToChipRai: FormConfig<typeof zRespondToChipRaiFormSchema> = {
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

const fcRespondToMedicaidRai: FormConfig<
  typeof zRespondToMedicaidRaiFormSchema
> = {
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

const fcWithdrawRai: FormConfig<typeof zWithdrawRaiFormSchema> = {
  schema: zWithdrawRaiFormSchema,
  attachments: [
    {
      name: "supportingDocumentation",
      label: "Supporting Documentation",
      required: false,
    },
  ],
};

const fcWithdrawPackage: FormConfig<typeof zWithdrawPackageFormSchema> = {
  schema: zWithdrawPackageFormSchema,
  attachments: [
    {
      name: "supportingDocumentation",
      label: "Supporting Documentation",
      required: false,
    },
  ],
};
