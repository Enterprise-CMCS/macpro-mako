import { submit } from "@/api/submissionService";
import { getUser } from "@/api/useGetUser";
import * as SC from "@/features/package-actions/shared-components";
import { ActionFunction } from "react-router-dom";
import { PlanType } from "shared-types";
import { z } from "zod";

export const toggleRaiResponseWithdrawSchema = z.object({
  raiWithdrawEnabled: z
    .boolean()
    .or(z.string())
    .transform((enabled) => Boolean(enabled)),
});

export const onValidSubmission: ActionFunction = async ({ request }) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const data = toggleRaiResponseWithdrawSchema.parse(formData);
    const user = await getUser();
    const authority = PlanType["1915(b)"];
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

  if (!formMethods.getValues("raiWithdrawEnabled")) {
    console.log("hello");
    formMethods.setValue("raiWithdrawEnabled", isEnabled);
  }

  return (
    <>
      <SC.Heading title="Enable and Disable Stuff" />
      <form onSubmit={handleSubmit}>
        <SC.SubmissionButtons />
      </form>
    </>
  );
};
