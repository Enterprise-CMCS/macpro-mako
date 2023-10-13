import { FormPageConfig } from "@/pages/submission-flow/renderers/FormPage";
import { ROUTES } from "@/routes";
import {
  AdditionalInfoInput,
  AdditionalInfoIntro,
  AttachmentsFields,
  AttachmentsIntro,
  EffectiveDateField,
  EffectiveDateIntro,
  FormIntro,
  SpaIDInput,
  SpaIDIntro,
} from "@/pages/submission-flow/renderers/FormFields";

export type AttachmentRequirement = {
  label: string;
  required: boolean;
  multiple: boolean;
};
const medicaidSpaAttachments: AttachmentRequirement[] = [
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
export const MEDICAID_SPA_FORM: FormPageConfig = {
  meta: {
    origin: "mako",
    authority: "medicaid-spa",
  },
  pageTitle: "Submit New Medicaid SPA",
  description: {
    heading: "Medicaid SPA Details",
    instructions: <FormIntro />,
  },
  fields: [
    {
      id: "spa-id",
      heading: {
        text: "SPA ID",
        linkText: "What is my SPA ID?",
        linkRoute: ROUTES.FAQ,
      },
      instructions: <SpaIDIntro />,
      field: (func) => <SpaIDInput handler={func} />,
    },
    {
      id: "proposed-effective-date",
      heading: "Proposed Effective Date of Medicaid SPA",
      instructions: <EffectiveDateIntro />,
      field: (func) => <EffectiveDateField handler={func} />,
    },
    {
      id: "attachments",
      heading: "Attachments",
      instructions: <AttachmentsIntro />,
      field: (func) => (
        <AttachmentsFields
          handler={func}
          attachmentsConfig={medicaidSpaAttachments}
        />
      ),
    },
    {
      id: "additional-info",
      heading: "Additional Information",
      instructions: <AdditionalInfoIntro />,
      field: (func) => <AdditionalInfoInput handler={func} />,
    },
  ],
};
