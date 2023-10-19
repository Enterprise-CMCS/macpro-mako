export const FORM_ORIGIN = "mako";
export enum AUTHORITY {
  MEDICAID_SPA = "medicaid spa",
  CHIP_SPA = "chip spa",
}
/** String values for input `name` property in submission form fields */
export enum SUBMISSION_FORM {
  SPA_ID = "id",
  ADDITIONAL_INFO = "additionalInformation",
  PROPOSED_EFFECTIVE_DATE = "proposedEffectiveDate",
  ATTACHMENTS = "attachments",
}

/** Unionize all enums containing form field names such as {@link SUBMISSION_FORM} */
export type FormFieldName = SUBMISSION_FORM;
