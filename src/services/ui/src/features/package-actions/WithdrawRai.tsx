import { submit } from "@/api/submissionService";
import { getUser } from "@/api/useGetUser";
import * as SC from "@/features/package-actions/shared-components";
import { zAttachmentOptional } from "@/pages/form/zod";
import { unflatten } from "flat";
import { useActionData, type ActionFunction } from "react-router-dom";
import { PlanType } from "shared-types";
import { z } from "zod";

export const withdrawRaiSchema = z.object({
  additionalInformation: z.string().optional(),
  attachments: z.object({
    supportingDocumentation: zAttachmentOptional,
  }),
});
type Attachments = keyof z.infer<typeof withdrawRaiSchema>["attachments"];

export const onValidSubmission: ActionFunction = async ({ request }) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const unflattenedFormData = unflatten(formData);

    const data = withdrawRaiSchema.parse(unflattenedFormData);
    const user = await getUser();
    const authority = PlanType["1915b"];

    await submit({ data, endpoint: "/action/withdraw-rai", user, authority });

    return null;
  } catch (err) {
    if (err instanceof Error) {
      return {
        errorMessage: err.message,
      };
    }
    return null;
  }
};

export const WithdrawRai = () => {
  const { handleSubmit } = SC.useSubmitForm();
  const { errorMessage } = useActionData() as { errorMessage: string };

  // do something to handle potential error message

  return (
    <>
      <SC.Heading title="Withdraw Formal RAI Response Details" />
      <SC.RequiredFieldDescription />
      <SC.ActionDescription>
        Complete this form to withdraw the Formal RAI response. Once complete,
        you and CMS will receive an email confirmation.
      </SC.ActionDescription>
      <SC.PackageSection id="test-spa-id" type="medicaid spa" />
      <form onSubmit={handleSubmit}>
        <SC.AttachmentsSection<Attachments>
          attachments={[
            {
              name: "Supporting Documentation",
              registerName: "supportingDocumentation",
              required: false,
            },
          ]}
        />
        <SC.AdditionalInformation />
        <SC.SubmissionButtons />
      </form>
    </>
  );
};
