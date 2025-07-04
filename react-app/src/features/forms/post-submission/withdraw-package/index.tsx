import { useParams } from "react-router";
import { SEATOOL_STATUS } from "shared-types";

import { useGetItem } from "@/api";
import { ActionForm, LoadingSpinner, PackageSection } from "@/components";
import { formSchemas } from "@/formSchemas";

export const WithdrawPackageActionWaiver = () => {
  const { authority, id } = useParams();
  const { data: waiver, isLoading: isWaiverLoading } = useGetItem(id);

  const authorityText = authority === "1915(c)" ? "1915(c) Appendix K" : authority;

  const waiverActionType = {
    New: "Initial Waiver",
    Renew: "Waiver Renewal",
    Amend: "Waiver Amendment",
  };

  if (isWaiverLoading === true) {
    return <LoadingSpinner />;
  }

  return (
    <ActionForm
      schema={formSchemas["withdraw-package"]}
      title={`Withdraw ${authorityText}`}
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
        faqLink: "/faq/withdraw-package-waiver",
        callout:
          "Upload your supporting documentation for withdrawal or explain your need for withdrawal in the Additional Information section.",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) =>
          check.recordExists && check.hasStatus(SEATOOL_STATUS.WITHDRAW_REQUESTED),
      }}
      bannerPostSubmission={{
        header: "Withdraw package request has been submitted",
        body: "If CMS needs any additional information, they will follow up by email.",
        variant: "success",
      }}
      breadcrumbText="Withdraw Package"
      formDescription={`Complete this form to withdraw ${
        authority === "1915(c)" ? "this 1915(c) Appendix K" : "a"
      } package. Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email.`}
      preSubmissionMessage="Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
      additionalInformation={{
        required: false,
        title: "Additional Information",
        label: "",
      }}
      promptPreSubmission={{
        acceptButtonText: "Yes, withdraw package",
        header: "Withdraw package?",
        body: `You are about to withdraw ${authorityText} ${
          waiverActionType[waiver?._source?.actionType]
        } ${id}. Completing this action will conclude the review of this ${authorityText} ${
          waiverActionType[waiver?._source.actionType]
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
        faqLink: "/faq/withdraw-package-spa",
        callout:
          "Upload your supporting documentation for withdrawal or explain your need for withdrawal in the Additional Information section.",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) =>
          check.recordExists && check.hasStatus(SEATOOL_STATUS.WITHDRAW_REQUESTED),
      }}
      bannerPostSubmission={{
        header: "Withdraw package request has been submitted",
        body: "If CMS needs any additional information, they will follow up by email.",
        variant: "success",
      }}
      breadcrumbText="Withdraw Package"
      formDescription="Complete this form to withdraw a package. Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
      preSubmissionMessage="Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
      additionalInformation={{
        required: false,
        title: "Additional Information",
        label: "",
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
        faqLink: "/faq/withdraw-package-chip-spa",
        callout:
          "Official withdrawal letters are required and must be on state letterhead signed by the State Medicaid Director or CHIP Director.",
      }}
      bannerPostSubmission={{
        header: "Withdraw package request has been submitted",
        body: "If CMS needs any additional information, they will follow up by email.",
        variant: "success",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) =>
          check.recordExists && check.hasStatus(SEATOOL_STATUS.WITHDRAW_REQUESTED),
      }}
      breadcrumbText="Withdraw Package"
      additionalInformation={{
        required: false,
        title: "Additional Information",
        label: "",
      }}
      formDescription="Complete this form to withdraw a package. Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
      preSubmissionMessage="Once complete, you will not be able to resubmit this package. CMS will be notified and will use this content to review your request. If CMS needs any additional information, they will follow up by email."
      promptPreSubmission={{
        acceptButtonText: "Yes, withdraw package",
        header: "Withdraw package?",
        body: `You are about to withdraw ${authority} ${id}. Completing this action will conclude the review of this ${authority} package. If you are not sure this is the correct action to select, contact your CMS point of contact for assistance.`,
      }}
    />
  );
};
