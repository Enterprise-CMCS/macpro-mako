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
enum MEDICAID_SPA_VALUES {
  SPA_ID = "spaId",
  PROPOSED_EFFECTIVE_DATE = "proposedEffectiveDate",
  ATTACHMENTS = "attachments",
  ADDITIONAL_INFO = "additionalInfo",
}
export type AttachmentRequirement = { label: string; required: boolean };
const medicaidSpaAttachments: AttachmentRequirement[] = [
  { label: "CMS 179", required: true },
  { label: "SPA Pages", required: true },
  { label: "Cover Letter", required: false },
  {
    label: "Document Demonstrating Good-Faith Tribal Engagement",
    required: false,
  },
  { label: "Existing State Plan Page(s)", required: false },
  { label: "Public Notice", required: false },
  { label: "Standard Funding Questions (SFQs)", required: false },
  { label: "Tribal Consultation", required: false },
  { label: "Other", required: false },
];
export const MEDICAID_SPA_FORM: FormPageConfig = {
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
