import { ActionForm } from "@/components/ActionForm";
import { PackageSection } from "@/components/Form/content/PackageSection";
import { formSchemas } from "@/formSchemas";
import { useParams } from "react-router";

export const WithdrawRaiForm = () => {
  const { authority, id } = useParams();
  const faqLink = authority?.includes("SPA")
    ? authority?.includes("CHIP")
      ? "chip-spa"
      : "spa"
    : "waiver";

  const authorityText = authority === "1915(c)" ? `1915(c) Appendix K` : authority;

  return (
    <ActionForm
      schema={formSchemas["withdraw-rai"]}
      title={`${authorityText} Withdraw Formal RAI Response Details`}
      fields={() => <PackageSection />}
      defaultValues={{
        id,
        authority,
      }}
      attachments={{
        faqLink: `/faq/withdraw-${faqLink}-rai-response`,
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
      breadcrumbText="Withdraw Formal RAI Response"
      formDescription="Complete this form to withdraw the Formal RAI response. Once complete,
          you and CMS will receive an email confirmation."
      preSubmissionMessage="Once complete, you and CMS will receive an email confirmation."
      bannerPostSubmission={{
        header: "RAI response withdrawn",
        body: `The RAI response for ${id} has been withdrawn. CMS may follow up if additional information is needed.`,
        variant: "success",
      }}
      additionalInformation={{
        required: true,
        title: "Additional Information",
        label: "Explain your need for withdrawal.",
      }}
      promptPreSubmission={{
        header: "Withdraw RAI response?",
        body: `The RAI response for ${id} will be withdrawn, and CMS will be notified.`,
        acceptButtonText: "Yes, withdraw response",
        cancelButtonText: "Cancel",
      }}
    />
  );
};
