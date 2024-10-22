import { ActionForm } from "@/components/ActionForm";
import { formSchemas } from "@/formSchemas";
import { PackageSection } from "@/components/Form/content/PackageSection";
import { useParams } from "react-router-dom";
import { isCmsUser } from "shared-utils";

export const EnableWithdrawRaiForm = () => {
  const { authority, id } = useParams();

  return (
    <ActionForm
      schema={formSchemas["toggle-withdraw-rai"]}
      title="Enable Formal RAI Response Withdraw Details"
      fields={() => <PackageSection />}
      defaultValues={{ id, authority, raiWithdrawEnabled: true }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
      breadcrumbText="Enable Formal RAI Response Withdraw"
      formDescription="Once you submit this form, the most recent Formal RAI Response for this
    package will be able to be withdrawn by the state"
      showPreSubmissionMessage={false}
      requiredFields={false}
      bannerPostSubmission={{
        header: "RAI response withdrawal enabled",
        body: `The state will be able to withdraw its RAI response. It may take up to a minute for this change to be applied.`,
        variant: "success",
      }}
      conditionsDeterminingUserAccess={[isCmsUser]}
    />
  );
};

export const DisableWithdrawRaiForm = () => {
  const { authority, id } = useParams();
  return (
    <ActionForm
      schema={formSchemas["toggle-withdraw-rai"]}
      title="Disable Formal RAI Response Withdraw Details"
      fields={() => <PackageSection />}
      defaultValues={{ id, authority, raiWithdrawEnabled: false }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
      breadcrumbText="Disable Formal RAI Response Withdraw"
      formDescription="The state will not be able to withdraw its RAI response. It may take up to a minute for this change to be applied."
      showPreSubmissionMessage={false}
      requiredFields={false}
      bannerPostSubmission={{
        header: "RAI response withdrawal disabled",
        body: `The state will not be able to withdraw its RAI response. It may take up to a minute for this change to be applied.`,
        variant: "success",
      }}
      conditionsDeterminingUserAccess={[isCmsUser]}
    />
  );
};
