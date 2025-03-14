import { Navigate, useParams } from "react-router";
import { SEATOOL_STATUS } from "shared-types";

import { useGetItem } from "@/api";
import { ActionForm, LoadingSpinner, PackageSection } from "@/components";
import { formSchemas } from "@/formSchemas";

export const RespondToRaiMedicaid = () => {
  const { authority, id } = useParams();
  return (
    <ActionForm
      schema={formSchemas["respond-to-rai-medicaid"]}
      title={`${authority} Formal RAI Response Details`}
      fields={() => <PackageSection />}
      defaultValues={{ id, authority }}
      attachments={{
        faqLink: "/faq/medicaid-spa-rai-attachments",
      }}
      promptPreSubmission={{
        acceptButtonText: "Yes, Submit",
        header: "Do you want to submit your official formal RAI response?",
        body: "By clicking Yes, Submit, you are submitting your official formal RAI Response to start the 90 day clock review process.",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists && check.hasStatus(SEATOOL_STATUS.SUBMITTED),
      }}
      breadcrumbText="Respond to Formal RAI"
      preSubmissionMessage="Once you submit this form, a confirmation email is sent to you and to CMS.
      CMS will use this content to review your package, and you will not be able
      to edit this form. If CMS needs any additional information, they will
      follow up by email."
      bannerPostSubmission={{
        header: "RAI response submitted",
        body: `The RAI response for ${id} has been submitted.`,
        variant: "success",
      }}
    />
  );
};
export const RespondToRaiWaiver = () => {
  const { authority, id } = useParams();
  const authorityText = authority === "1915(c)" ? "1915(c) Appendix K" : authority;

  const { data: record, isLoading } = useGetItem(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!record) {
    return <Navigate to="/dashboard" />;
  }

  const { actionType } = record._source;

  return (
    <ActionForm
      schema={formSchemas["respond-to-rai-waiver"]}
      title={`${authorityText} Waiver Formal RAI Response Details`}
      fields={() => <PackageSection />}
      defaultValues={{ id, authority, actionType }}
      attachments={{
        faqLink: "/faq/waiverb-rai-attachments",
      }}
      promptPreSubmission={{
        acceptButtonText: "Yes, Submit",
        header: "Do you want to submit your official formal RAI response?",
        body: "By clicking Yes, Submit, you are submitting your official formal RAI Response to start the 90 day clock review process.",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists && check.hasStatus(SEATOOL_STATUS.SUBMITTED),
      }}
      breadcrumbText="Respond to Formal RAI"
      preSubmissionMessage="Once you submit this form, a confirmation email is sent to you and to CMS.
      CMS will use this content to review your package, and you will not be able
      to edit this form. If CMS needs any additional information, they will
      follow up by email."
      bannerPostSubmission={{
        header: "RAI response submitted",
        body: `The RAI response for ${id} has been submitted.`,
        variant: "success",
      }}
    />
  );
};
export const RespondToRaiChip = () => {
  const { authority, id } = useParams();
  return (
    <ActionForm
      schema={formSchemas["respond-to-rai-chip"]}
      title={`${authority} Formal RAI Response Details`}
      fields={() => <PackageSection />}
      defaultValues={{ id, authority }}
      attachments={{
        faqLink: "/faq/chip-spa-rai-attachments",
      }}
      promptPreSubmission={{
        acceptButtonText: "Yes, Submit",
        header: "Do you want to submit your official formal RAI response?",
        body: "By clicking Yes, Submit, you are submitting your official formal RAI Response to restart the SPA review process and a new 90th day will be identified.",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists && check.hasStatus(SEATOOL_STATUS.SUBMITTED),
      }}
      breadcrumbText="Respond to Formal RAI"
      preSubmissionMessage="Once you submit this form, a confirmation email is sent to you and to CMS.
      CMS will use this content to review your package, and you will not be able
      to edit this form. If CMS needs any additional information, they will
      follow up by email."
      bannerPostSubmission={{
        header: "RAI response submitted",
        body: `The RAI response for ${id} has been submitted.`,
        variant: "success",
      }}
    />
  );
};
