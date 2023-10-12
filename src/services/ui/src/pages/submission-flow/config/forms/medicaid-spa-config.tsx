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
      field: (func) => <AttachmentsFields handler={func} />,
    },
    {
      id: "additional-info",
      heading: "Additional Information",
      instructions: <AdditionalInfoIntro />,
      field: (func) => <AdditionalInfoInput handler={func} />,
    },
  ],
};
