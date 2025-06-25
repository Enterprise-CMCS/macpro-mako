import { useParams } from "react-router";
import { SEATOOL_STATUS } from "shared-types";

import { ActionForm } from "@/components/ActionForm";
import { PackageSection } from "@/components/Form/content/PackageSection";
import { formSchemas } from "@/formSchemas";

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
        documentChecker: (check) =>
          check.recordExists && check.hasStatus(SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED),
      }}
      breadcrumbText="Withdraw Formal RAI Response"
      formDescription="Complete this form to withdraw the Formal RAI response. Once complete,
          you and CMS will receive an email confirmation."
      preSubmissionMessage="Once complete, you and CMS will receive an email confirmation."
      bannerPostSubmission={{
        header: "Withdraw Formal RAI Response request has been submitted.",
        body: "Your Formal RAI Response has been withdrawn successfully. If CMS needs any additional information, they will follow up by email.",
        variant: "success",
      }}
      additionalInformation={{
        required: true,
        title: "Additional Information",
        label: "",
      }}
      promptPreSubmission={{
        header: "Withdraw Formal RAI response?",
        body: `You are about to withdraw the Formal RAI Response for ${id}. CMS will be notified.`,
        acceptButtonText: "Yes, withdraw response",
        cancelButtonText: "Cancel",
      }}
    />
  );
};
