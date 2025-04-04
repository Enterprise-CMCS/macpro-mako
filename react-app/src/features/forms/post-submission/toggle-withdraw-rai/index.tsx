import { useParams } from "react-router";
import { isCmsUser } from "shared-utils";

import { ActionForm } from "@/components/ActionForm";
import { PackageSection } from "@/components/Form/content/PackageSection";
import { formSchemas } from "@/formSchemas";

export const EnableWithdrawRaiForm = () => {
  const { authority, id } = useParams();

  return (
    <ActionForm
      schema={formSchemas["toggle-withdraw-rai"]}
      additionalInformation={false}
      title="Enable Formal RAI Response Withdraw Details"
      fields={() => <PackageSection />}
      defaultValues={{ id, authority, raiWithdrawEnabled: true }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists && check.hasEnabledRaiWithdraw,
      }}
      breadcrumbText="Enable Formal RAI Response Withdraw"
      formDescription="Once you submit this form, the most recent Formal RAI Response for this
    package will be able to be withdrawn by the state"
      showPreSubmissionMessage={false}
      areFieldsRequired={false}
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
      additionalInformation={false}
      title="Disable Formal RAI Response Withdraw Details"
      fields={() => <PackageSection />}
      defaultValues={{ id, authority, raiWithdrawEnabled: false }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists && !check.hasEnabledRaiWithdraw,
      }}
      breadcrumbText="Disable Formal RAI Response Withdraw"
      formDescription="The state will not be able to withdraw its RAI response. It may take up to a minute for this change to be applied."
      showPreSubmissionMessage={false}
      areFieldsRequired={false}
      bannerPostSubmission={{
        header: "RAI response withdrawal disabled",
        body: `The state will not be able to withdraw its RAI response. It may take up to a minute for this change to be applied.`,
        variant: "success",
      }}
      conditionsDeterminingUserAccess={[isCmsUser]}
    />
  );
};
