import {
  FormPage,
  FormPageConfig,
} from "@/pages/submission-flow/renderers/FormPage";
import {
  AttachmentFieldOption,
  FormIntro,
} from "@/pages/submission-flow/renderers/FormFields";
import { AUTHORITY, FORM_ORIGIN } from "@/consts/forms";
import {
  additionalInfoField,
  attachmentsFieldWithRequirement,
  proposedEffectiveField,
  spaIdField,
} from "@/pages/submission-flow/config/forms/common";

/** List of attachment drop zones to render */
const medicaidSpaAttachments: AttachmentFieldOption[] = [
  { label: "CMS 179", required: true, multiple: false },
  { label: "SPA Pages", required: true, multiple: true },
  { label: "Cover Letter", required: false, multiple: true },
  {
    label: "Document Demonstrating Good-Faith Tribal Engagement",
    required: false,
    multiple: true,
  },
  { label: "Existing State Plan Page(s)", required: false, multiple: true },
  { label: "Public Notice", required: false, multiple: true },
  {
    label: "Standard Funding Questions (SFQs)",
    required: false,
    multiple: true,
  },
  { label: "Tribal Consultation", required: false, multiple: true },
  { label: "Other", required: false, multiple: true },
];

/** Config for the Medicaid SPA form */
export const MEDICAID_SPA_FORM: FormPageConfig = {
  meta: {
    origin: FORM_ORIGIN,
    authority: AUTHORITY.MEDICAID_SPA,
  },
  pageTitle: "Submit New Medicaid SPA",
  description: {
    heading: "Medicaid SPA Details",
    instructions: <FormIntro />,
  },
  fields: [
    spaIdField,
    proposedEffectiveField,
    attachmentsFieldWithRequirement(medicaidSpaAttachments),
    additionalInfoField,
  ],
};

export const MedicaidSpaForm = () => <FormPage {...MEDICAID_SPA_FORM} />;
