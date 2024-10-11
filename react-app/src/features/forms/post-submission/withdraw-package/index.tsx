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
      additionalInfoLabel="Explain your need for withdrawal."
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
    />
  );
};
