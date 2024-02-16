import { submit } from "@/api/submissionService";
import { getUser } from "@/api/useGetUser";
import * as SC from "@/features/package-actions/shared-components";
import { zAttachmentOptional } from "@/pages/form/zod";
import { unflatten } from "flat";
import { useParams } from "react-router-dom";
import { PlanType } from "shared-types";
import { z } from "zod";

export const withdrawPackageSchema = z.object({
  additionalInformation: z.string(),
  attachments: z.object({
    supportingDocumentation: zAttachmentOptional,
  }),
});
type Attachments = keyof z.infer<typeof withdrawPackageSchema>["attachments"];

export const onValidSubmission: SC.ActionFunction = async ({
  request,
  params,
}) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const unflattenedFormData = unflatten(formData);

    const data = withdrawPackageSchema.parse(unflattenedFormData);
    const user = await getUser();
    const authority = PlanType["1915b"];

    await submit({
      data: { ...data, id: params.id },
      endpoint: "/action/withdraw-package",
      user,
      authority,
    });

    return { submitted: true };
  } catch (err) {
    return { submitted: false };
  }
};

export const WithdrawPackage = () => {
  const { handleSubmit } = SC.useSubmitForm();
  const { id } = useParams();
  SC.useDisplaySubmissionAlert(
    "Package withdrawn",
    `The package ${id} has been withdrawn.`
  );

  return (
    <>
      <SC.Heading title="Withdraw Medicaid SPA Package" />
      <SC.RequiredFieldDescription />
      <SC.ActionDescription>
        Complete this form to withdraw a package. Once complete, you will not be
        able to resubmit this package. CMS will be notified and will use this
        content to review your request. If CMS needs any additional information,
        they will follow up by email.
      </SC.ActionDescription>
      <SC.PackageSection id={id!} type="Waiver 1915(b)" />
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
