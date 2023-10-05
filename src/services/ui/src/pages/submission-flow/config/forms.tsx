import { FormPageConfig } from "@/pages/submission-flow/renderers/FormPage";

export const MEDICAID_SPA_FORM: FormPageConfig = {
  pageTitle: "Submit New Medicaid SPA",
  descriptionHeading: "Medicaid SPA Details",
  descriptionElement: (
    <p>
      Once you submit this form, a confirmation email is sent to you and to CMS.
      CMS will use this content to review your package, and you will not be able
      to edit this form. If CMS needs any additional information, they will
      follow up by email.{" "}
      <b>If you leave this page, you will lose your progress on this form.</b>
    </p>
  ),
};
