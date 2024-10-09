import { ActionForm, PackageSection } from "@/components";
import { formSchemas } from "@/formSchemas";
import { useParams } from "react-router-dom";

export const WithdrawPackageAction = () => {
  const { authority, id } = useParams();

  return (
    <ActionForm
      schema={formSchemas["withdraw-package"]}
      title={`${authority} Withdraw Package`}
      fields={() => <PackageSection />}
      defaultValues={{
        id,
        authority,
      }}
      attachments={{
        faqLink: "/faq",
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
      breadcrumbText="Withdraw Formal RAI Response"
      formDescription="Complete this form to withdraw the Formal RAI response. Once complete,
          you and CMS will receive an email confirmation."
      preSubmissionMessage="Once complete, you and CMS will receive an email confirmation."
      additionalInfoLabel="Explain your need for withdrawal."
    />
  );
};
