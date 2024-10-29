import { useGetItem } from "@/api";
import { ActionForm, PackageSection } from "@/components";
import { formSchemas } from "@/formSchemas";
import { useParams } from "react-router-dom";

export const WithdrawPackageActionWaiver = () => {
  const { authority, id } = useParams();
  const { data } = useGetItem(id);
  const waiverActionType = {
    New: "initial waiver",
    Renew: "waiver renewal",
    Amend: "waiver amendment",
  };

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
        callout:
          "Upload your supporting documentation for withdrawal or explain your need for withdrawal in the Additional Information section.",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
      bannerPostSubmission={{
        header: "Package withdrawn",
        body: `The package ${id} has been withdrawn.`,
        variant: "success",
      }}
      breadcrumbText="Withdraw Package"
      formDescription="Complete this form to withdraw a package. Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
      preSubmissionMessage="Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
      additionalInformation={{
        required: false,
        title: "Additional Information",
        label:
          "Explain your need for withdrawal, or upload supporting documentation.",
      }}
      promptPreSubmission={{
        acceptButtonText: "Yes, withdraw package",
        header: "Withdraw package?",
        body: `You are about to withdraw ${authority} ${
          waiverActionType[data._source.actionType]
        } ${id}. Completing this action will conclude the review of this ${authority} ${
          waiverActionType[data._source.actionType]
        } package. If you are not sure this is the correct action to select, contact your CMS point of contact for assistance.`,
      }}
    />
  );
};

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
        callout:
          "Upload your supporting documentation for withdrawal or explain your need for withdrawal in the Additional Information section.",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
      bannerPostSubmission={{
        header: "Package withdrawn",
        body: `The package ${id} has been withdrawn.`,
        variant: "success",
      }}
      breadcrumbText="Withdraw Package"
      formDescription="Complete this form to withdraw a package. Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
      preSubmissionMessage="Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
      additionalInformation={{
        required: false,
        title: "Additional Information",
        label:
          "Explain your need for withdrawal, or upload supporting documentation.",
      }}
      promptPreSubmission={{
        acceptButtonText: "Yes, withdraw package",
        header: "Withdraw package?",
        body: `You are about to withdraw ${authority} ${id}. Completing this action will conclude the review of this ${authority} package. If you are not sure this is the correct action to select, contact your CMS point of contact for assistance.`,
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
        callout:
          "Official withdrawal letters are required and must be on state letterhead signed by the State Medicaid Director or CHIP Director.",
      }}
      bannerPostSubmission={{
        header: "Package withdrawn",
        body: `The package ${id} has been withdrawn.`,
        variant: "success",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
      breadcrumbText="Withdraw Package"
      additionalInformation={{
        required: false,
        title: "Additional Information",
        label: "Explain your need for withdrawal.",
      }}
      formDescription="Complete this form to withdraw a package. Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
      promptPreSubmission={{
        acceptButtonText: "Yes, withdraw package",
        header: "Withdraw package?",
        body: `You are about to withdraw ${authority} ${id}. Completing this action will conclude the review of this ${authority} package. If you are not sure this is the correct action to select, contact your CMS point of contact for assistance.`,
      }}
    />
  );
};
