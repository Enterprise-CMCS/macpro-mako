import { SUBMISSION_FORM } from "@/consts/forms";
import { ROUTES } from "@/routes";
import {
  AdditionalInfoInput,
  AdditionalInfoIntro,
  AttachmentFieldOption,
  AttachmentsFields,
  AttachmentsIntro,
  EffectiveDateField,
  EffectiveDateIntro,
  SpaIDInput,
  SpaIDIntro,
} from "@/pages/submission-flow/renderers/FormFields";
import { ChangeEvent, ReactElement } from "react";

export type Handler = (e: ChangeEvent<any>) => void;
/* Some headers need an additional link to an FAQ section */
type HeadingWithLink = {
  text: string;
  linkText: string;
  linkRoute: ROUTES;
};
export type FormSection = {
  id: string;
  heading: string | HeadingWithLink;
  instructions: ReactElement;
  field: (func: Handler) => ReactElement;
  required: boolean;
};

export const spaIdField: FormSection = {
  id: SUBMISSION_FORM.SPA_ID,
  heading: {
    text: "SPA ID",
    linkText: "What is my SPA ID?",
    linkRoute: ROUTES.FAQ,
  },
  required: true,
  instructions: <SpaIDIntro />,
  field: (func) => <SpaIDInput handler={func} />,
};

export const proposedEffectiveField: FormSection = {
  id: SUBMISSION_FORM.PROPOSED_EFFECTIVE_DATE,
  heading: "Proposed Effective Date of Medicaid SPA",
  required: true,
  instructions: <EffectiveDateIntro />,
  field: (func) => <EffectiveDateField handler={func} />,
};

export const attachmentsFieldWithRequirement = (
  requirement: AttachmentFieldOption[]
): FormSection => ({
  id: SUBMISSION_FORM.ATTACHMENTS,
  heading: "Attachments",
  required: false,
  instructions: <AttachmentsIntro />,
  field: (func) => (
    <AttachmentsFields handler={func} attachmentsConfig={requirement} />
  ),
});

export const additionalInfoField: FormSection = {
  id: SUBMISSION_FORM.ADDITIONAL_INFO,
  heading: "Additional Information",
  required: false,
  instructions: <AdditionalInfoIntro />,
  field: (func) => <AdditionalInfoInput handler={func} />,
};
