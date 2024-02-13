import { submit } from "@/api/submissionService";
import { getUser } from "@/api/useGetUser";
import * as SC from "@/features/package-actions/shared-components";
import { ActionFunction, useActionData } from "react-router-dom";
import { PlanType } from "shared-types";
import { z } from "zod";

export const toggleRaiResponseWithdrawSchema = z.object({
  raiWithdrawEnabled: z.string().transform((enabled) => Boolean(enabled)),
});

export const onValidSubmission: ActionFunction = async ({ request }) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const data = toggleRaiResponseWithdrawSchema.parse(formData);
    const user = await getUser();
    const authority = PlanType["1915b"];
    const enableOrDisable = data.raiWithdrawEnabled
      ? "/action/enable-rai-withdraw"
      : "/action/disable-rai-withdraw";

    await submit({
      data,
      endpoint: enableOrDisable,
      user,
      authority,
    });

    return null;
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      return {
        errorMessage: err.message,
      };
    }
    return null;
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
    formMethods.setValue("raiWithdrawEnabled", isEnabled);
  }

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
      <SC.PackageSection id="test-spa-id" type="testing" />
      <form onSubmit={handleSubmit}>
        <SC.SubmissionButtons />
      </form>
    </>
  );
};
