import {
  FormPage,
  FormPageConfig,
} from "@/pages/submission-flow/renderers/FormPage";
import { AUTHORITY, FORM_ORIGIN } from "@/consts/forms";
import {
  AttachmentFieldOption,
  FormIntro,
} from "@/pages/submission-flow/renderers/FormFields";
import {
  additionalInfoField,
  attachmentsFieldWithRequirement,
  proposedEffectiveField,
  spaIdField,
} from "@/pages/submission-flow/config/forms/common";
/** List of attachment drop zones to render */
const chipSpaAttachments: AttachmentFieldOption[] = [
  { label: "Current State Plan", required: true, multiple: true },
  { label: "Amended State Plan Language", required: true, multiple: true },
  { label: "Cover Letter", required: true, multiple: true },
  {
    label: "Budget Documents",
    required: false,
    multiple: true,
  },
  { label: "Public Notice", required: false, multiple: true },
  { label: "Tribal Consultation", required: false, multiple: true },
  { label: "Other", required: false, multiple: true },
];
export const CHIP_SPA_FORM: FormPageConfig = {
  meta: {
    origin: FORM_ORIGIN,
    authority: AUTHORITY.CHIP_SPA,
  },
  pageTitle: "Submit New CHIP SPA",
  description: {
    heading: "CHIP SPA Details",
    instructions: <FormIntro />,
  },
  fields: [
    spaIdField,
    proposedEffectiveField,
    attachmentsFieldWithRequirement(chipSpaAttachments),
    additionalInfoField,
  ],
};

export const ChipSpaForm = () => <FormPage {...CHIP_SPA_FORM} />;
