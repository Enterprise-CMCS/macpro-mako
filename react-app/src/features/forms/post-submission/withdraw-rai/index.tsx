import { ActionForm, PackageSection } from "@/components";
import { formSchemas } from "@/formSchemas";
import { useParams } from "react-router-dom";
import { useGetItem } from "@/api";

export const WithdrawRaiForm = () => {
  const { authority, id } = useParams();
  const { data } = useGetItem(id);
  console.log(data);
  return (
    <ActionForm
      schema={formSchemas["withdraw-rai"]}
      title={`${authority} Withdraw Formal RAI Response Details`}
      fields={() => <PackageSection />}
      defaultValues={{
        id,
        authority,
        raiRequestedDate: data._source.raiRequestedDate,
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