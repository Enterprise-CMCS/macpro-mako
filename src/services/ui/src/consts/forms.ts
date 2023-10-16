export const FORM_ORIGIN = "mako";
export enum AUTHORITY {
  MEDICAID_SPA = "medicaid spa",
}
/** String values for input `name` property in submission form fields */
export enum SUBMISSION_FORM {
  SPA_ID = "id",
  ADDITIONAL_INFO = "additionalInformation",
  // TODO: Proposed Effective Date and Attachments need to be integrated
  //  into API body properly (OY2-25155)
  PROPOSED_EFFECTIVE_DATE = "proposedEffectiveDate",
  ATTACHMENTS = "attachments",
}
