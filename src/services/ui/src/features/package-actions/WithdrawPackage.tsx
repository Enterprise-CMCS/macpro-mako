import { submit } from "@/api/submissionService";
import { getUser } from "@/api/useGetUser";
import { useModalContext } from "@/components/Context/modalContext";
import { Button } from "@/components/Inputs";
import * as SC from "@/features/package-actions/shared-components";
import { zAttachmentOptional } from "@/pages/form/zod";
import { unflatten } from "flat";
import { useNavigate, useNavigation, useParams } from "react-router-dom";
import { Authority } from "shared-types";
import { z } from "zod";

export const withdrawPackageSchema = z.object({
  additionalInformation: z.string(),
  attachments: z
    .object({
      supportingDocumentation: zAttachmentOptional,
    })
    .optional(),
});
type Attachments = keyof NonNullable<
  z.infer<typeof withdrawPackageSchema>["attachments"]
>;

export const onValidSubmission: SC.ActionFunction = async ({
  request,
  params,
}) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const unflattenedFormData = unflatten(formData);

    const data = withdrawPackageSchema.parse(unflattenedFormData);
    const user = await getUser();
    const authority = Authority["1915b"];

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
  const { id, authority } = useParams() as { id: string; authority: Authority };
  const title: Record<Authority, string> = {
    "1915(b)": "Withdraw Waiver",
    "1915(c)": "Withdraw Waiver",
    "chip spa": "Withdraw CHIP SPA Package",
    "medicaid spa": "Withdraw Medicaid SPA Package",
    waiver: "Withdraw Waiver",
  };
  SC.useDisplaySubmissionAlert(
    "Package withdrawn",
    `The package ${id} has been withdrawn.`
  );

  return (
    <>
      <SC.Heading title={title[authority]} />
      <SC.RequiredFieldDescription />
      <SC.ActionDescription>
        Complete this form to withdraw a package. Once complete, you will not be
        able to resubmit this package. CMS will be notified and will use this
        content to review your request. If CMS needs any additional information,
        they will follow up by email.
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
        <SubmissionButtons handleSubmit={handleSubmit} />
      </form>
    </>
  );
};

export const SubmissionButtons = ({
  handleSubmit,
}: {
  handleSubmit: () => void;
}) => {
  const { state } = useNavigation();
  const modal = useModalContext();
  const navigate = useNavigate();

  const acceptActionCancel = () => {
    modal.setModalOpen(false);
    navigate(-1);
  };
  const acceptActionSubmit = () => {
    modal.setModalOpen(false);
    handleSubmit();
  };

  return (
    <section className="space-x-2 mb-8">
      <Button
        disabled={state === "submitting"}
        onClick={() => {
          modal.setContent({
            header: "Stop form submission?",
            body: "All information you've entered on this form will be lost if you leave this page.",
            acceptButtonText: "Yes, leave form",
            cancelButtonText: "Return to form",
          });

          modal.setOnAccept(() => acceptActionSubmit);

          modal.setModalOpen(true);
        }}
      >
        Submit
      </Button>
      <Button
        onClick={() => {
          modal.setContent({
            header: "Stop form submission?",
            body: "All information you've entered on this form will be lost if you leave this page.",
            acceptButtonText: "Yes, leave form",
            cancelButtonText: "Return to form",
          });

          modal.setOnAccept(() => acceptActionCancel);

          modal.setModalOpen(true);
        }}
        variant={"outline"}
        type="reset"
        disabled={state === "submitting"}
      >
        Cancel
      </Button>
    </section>
  );
};
