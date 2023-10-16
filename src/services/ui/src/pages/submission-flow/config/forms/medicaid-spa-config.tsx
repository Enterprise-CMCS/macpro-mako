import { FormPageConfig } from "@/pages/submission-flow/renderers/FormPage";
import { ROUTES } from "@/routes";
import {
  AdditionalInfoInput,
  AdditionalInfoIntro,
  AttachmentFieldOption,
  AttachmentsFields,
  AttachmentsIntro,
  EffectiveDateField,
  EffectiveDateIntro,
  FormIntro,
  SpaIDInput,
  SpaIDIntro,
} from "@/pages/submission-flow/renderers/FormFields";
import { AUTHORITY, FORM_ORIGIN, SUBMISSION_FORM } from "@/consts/forms";

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
    {
      id: SUBMISSION_FORM.SPA_ID,
      heading: {
        text: "SPA ID",
        linkText: "What is my SPA ID?",
        linkRoute: ROUTES.FAQ,
      },
      required: true,
      instructions: <SpaIDIntro />,
      field: (func) => <SpaIDInput handler={func} />,
    },
    {
      id: SUBMISSION_FORM.PROPOSED_EFFECTIVE_DATE,
      heading: "Proposed Effective Date of Medicaid SPA",
      required: true,
      instructions: <EffectiveDateIntro />,
      field: (func) => <EffectiveDateField handler={func} />,
    },
    {
      id: SUBMISSION_FORM.ATTACHMENTS,
      heading: "Attachments",
      required: false,
      instructions: <AttachmentsIntro />,
      field: (func) => (
        <AttachmentsFields
          handler={func}
          attachmentsConfig={medicaidSpaAttachments}
        />
      ),
    },
    {
      id: SUBMISSION_FORM.ADDITIONAL_INFO,
      heading: "Additional Information",
      required: false,
      instructions: <AdditionalInfoIntro />,
      field: (func) => <AdditionalInfoInput handler={func} />,
    },
  ],
};
