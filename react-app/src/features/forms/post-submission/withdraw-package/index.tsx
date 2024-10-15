import { ActionForm, PackageSection } from "@/components";
import { formSchemas } from "@/formSchemas";
import { useParams } from "react-router-dom";

export const WithdrawPackageAction = () => {
  const { authority, id } = useParams();

  return (
    <ActionForm
      schema={formSchemas["withdraw-package"]}
      title={`Withdraw ${authority}`}
      fields={() => <PackageSection />}
      defaultValues={{
        id,
        authority,
        attachments: {
          supportingDocumentation: {
            files: [],
          },
        },
      }}
      attachments={{
        faqLink: "/faq",
        outerInstructions:
          "Upload your supporting documentation for withdrawal or explain your need for withdrawal in the Additional Information section.",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
      breadcrumbText="Withdraw Package"
      formDescription="Complete this form to withdraw a package. Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
      preSubmissionMessage="Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
      additionalInfoLabel="Explain your need for withdrawal, or upload supporting documentation."
      promptPreSubmission={{
        header: "Withdraw package?",
        body: `You are about to withdraw ${authority} ${id}. Completing this action will conclude the review of this ${authority} ${
          ["Medicaid SPA"].includes(authority) ? "SPA" : "Waiver"
        } package. If you are not sure this is the correct action to select, contact your CMS point of contact for assistance.`,
      }}
    />
  );
};

export const WithdrawPackageActionChip = () => {
  const { authority, id } = useParams();

  return (
    <ActionForm
      schema={formSchemas["withdraw-package-chip"]}
      title={`Withdraw ${authority}`}
      fields={() => <PackageSection />}
      defaultValues={{
        id,
        authority,
      }}
      attachments={{
        faqLink: "/faq",
        outerInstructions:
          "Official withdrawal letters are required and must be on state letterhead signed by the State Medicaid Director or CHIP Director.",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
      breadcrumbText="Withdraw Package"
      additionalInfoLabel="Explain your need for withdrawal."
      formDescription="Complete this form to withdraw a package. Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
      promptPreSubmission={{
        header: "Withdraw package?",
        body: `You are about to withdraw ${authority} ${id}. Completing this action will conclude the review of this ${authority} SPA package. If you are not sure this is the correct action to select, contact your CMS point of contact for assistance.`,
      }}
    />
  );
};
