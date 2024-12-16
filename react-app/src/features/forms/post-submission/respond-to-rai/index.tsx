import { ActionForm, PackageSection } from "@/components";
import { formSchemas } from "@/formSchemas";
import { useParams } from "react-router";

export const RespondToRaiMedicaid = () => {
  const { authority, id } = useParams();
  return (
    <ActionForm
      schema={formSchemas["respond-to-rai-medicaid"]}
      title={`${authority} Formal RAI Response Details`}
      fields={() => <PackageSection />}
      defaultValues={{ id }}
      attachments={{
        faqLink: "/faq/medicaid-spa-rai-attachments",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
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

  return (
    <ActionForm
      schema={formSchemas["respond-to-rai-waiver"]}
      title={`${authorityText} Waiver Formal RAI Response Details`}
      fields={() => <PackageSection />}
      defaultValues={{ id }}
      attachments={{
        faqLink: "/faq/waiverb-rai-attachments",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
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
      defaultValues={{ id }}
      attachments={{
        faqLink: "/faq/chip-spa-rai-attachments",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
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
