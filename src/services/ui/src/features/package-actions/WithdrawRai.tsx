import { submit } from "@/api/submissionService";
import { getUser } from "@/api/useGetUser";
import * as SC from "@/features/package-actions/shared-components";
import { zAttachmentOptional } from "@/pages/form/zod";
import { unflatten } from "flat";
import { useParams } from "react-router-dom";
import { Authority } from "shared-types";
import { z } from "zod";

export const withdrawRaiSchema = z.object({
  additionalInformation: z.string().optional(),
  attachments: z.object({
    supportingDocumentation: zAttachmentOptional,
  }),
});
type Attachments = keyof z.infer<typeof withdrawRaiSchema>["attachments"];

export const onValidSubmission: SC.ActionFunction = async ({
  request,
  params,
}) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const unflattenedFormData = unflatten(formData);

    const data = withdrawRaiSchema.parse(unflattenedFormData);
    const user = await getUser();
    const authority = Authority["1915b"];

    await submit({
      data: { ...data, id: params.id },
      endpoint: "/action/withdraw-rai",
      user,
      authority,
    });

    return {
      submitted: true,
    };
  } catch (err) {
    return {
      submitted: false,
    };
  }
};

export const WithdrawRai = () => {
  const { handleSubmit } = SC.useSubmitForm();
  const { id } = useParams();
  SC.useDisplaySubmissionAlert(
    "RAI response withdrawn",
    `The RAI response for ${id} has been withdrawn. CMS may follow up if additional information is needed.`
  );

  return (
    <>
      <SC.Heading title="Withdraw Formal RAI Response Details" />
      <SC.RequiredFieldDescription />
      <SC.ActionDescription>
        Complete this form to withdraw the Formal RAI response. Once complete,
        you and CMS will receive an email confirmation.
      </SC.ActionDescription>
      <SC.PackageSection />
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
        <SC.FormLoadingSpinner />
        <SC.ErrorBanner />
        <SC.SubmissionButtons />
      </form>
    </>
  );
};
