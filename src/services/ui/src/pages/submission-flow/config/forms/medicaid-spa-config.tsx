import { FormPageConfig } from "@/pages/submission-flow/renderers/FormPage";
import { ROUTES } from "@/routes";
import {
  AdditionalInfoInput,
  AdditionalInfoIntro,
  AttachmentsIntro,
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
      content: <SpaIDInput />,
    },
    {
      id: "proposed-effective-date",
      heading: "Proposed Effective Date of Medicaid SPA",
      instructions: (
        <p className="text-gray-500 font-light mt-1">For example: 4/28/1986</p>
      ),
      content: <></>,
    },
    {
      id: "attachments",
      heading: "Attachments",
      instructions: <AttachmentsIntro />,
      content: <></>,
    },
    {
      id: "additional-info",
      heading: "Additional Information",
      instructions: <AdditionalInfoIntro />,
      content: <AdditionalInfoInput />,
    },
  ],
};
