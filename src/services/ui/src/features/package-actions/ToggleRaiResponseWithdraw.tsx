import { submit } from "@/api/submissionService";
import { getUser } from "@/api/useGetUser";
import * as SC from "@/features/package-actions/shared-components";
import { useParams } from "react-router-dom";
import { Authority } from "shared-types";
import { z } from "zod";

export const toggleRaiResponseWithdrawSchema = z.object({
  raiWithdrawEnabled: z
    .string()
    .or(z.boolean())
    .transform((enabled) => {
      return enabled.toString() === "true";
    }),
});

export const onValidSubmission: SC.ActionFunction = async ({
  request,
  params,
}) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const data = toggleRaiResponseWithdrawSchema.parse(formData);
    const user = await getUser();
    const authority = Authority["1915b"];
    const enableOrDisable = data.raiWithdrawEnabled
      ? "/action/enable-rai-withdraw"
      : "/action/disable-rai-withdraw";

    await submit({
      data: { ...data, id: params.id },
      endpoint: enableOrDisable,
      user,
      authority,
    });

    return { submitted: true };
  } catch (err) {
    return { submitted: false };
  }
};

type Props = {
  isEnabled: boolean;
};

export const ToggleRaiResponseWithdraw = ({ isEnabled }: Props) => {
  const { formMethods, handleSubmit } = SC.useSubmitForm();
  const raiTypeText = isEnabled ? "Enable" : "Disable";
  const raiDescriptionText = isEnabled
    ? "Once you submit this form, the most recent Formal RAI Response for this package will be able to be withdrawn by the state. "
    : "Once you submit this form, you will disable the previous Formal RAI Response Withdraw - Enabled action. The State will not be able to withdraw the Formal RAI Response. ";

  if (!formMethods.getValues("raiWithdrawEnabled")) {
    console.log("testing", isEnabled);
    formMethods.setValue("raiWithdrawEnabled", isEnabled);
  }

  const { id } = useParams();
  SC.useDisplaySubmissionAlert(
    `RAI response withdrawal ${raiTypeText.toLowerCase()}d`,
    raiTypeText === "Enable"
      ? "The state will be able to withdraw its RAI response. It may take up to a minute for this change to be applied."
      : "The state will not be able to withdraw its RAI response. It may take up to a minute for this change to be applied."
  );

  return (
    <>
      <SC.Heading
        title={`${raiTypeText} Formal RAI Response Withdraw Details`}
      />
      <SC.ActionDescription>
        {raiDescriptionText}
        <strong className="font-bold">
          If you leave this page, you will lose your progress on this form.
        </strong>
      </SC.ActionDescription>
      <SC.PackageSection />
      <form onSubmit={handleSubmit}>
        <SC.FormLoadingSpinner />
        <SC.ErrorBanner />
        <SC.SubmissionButtons />
      </form>
    </>
  );
};
