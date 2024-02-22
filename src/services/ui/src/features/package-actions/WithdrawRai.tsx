import { submit } from "@/api/submissionService";
import { getUser } from "@/api/useGetUser";
import { Alert } from "@/components";
import { Info } from "lucide-react";
import * as SC from "@/features/package-actions/shared-components";
import { zAttachmentOptional } from "@/pages/form/zod";
import { unflatten } from "flat";
import { useParams } from "react-router-dom";
import { Authority } from "shared-types";
import { z } from "zod";
import { useModalContext } from "@/components/Context/modalContext";

const title: Record<Authority, string> = {
  "1915(b)": "1915(b) Withdraw Formal RAI Response Details",
  "1915(c)": "Formal RAI Details",
  "chip spa": "Formal RAI Details",
  "medicaid spa": "Formal RAI Details",
  waiver: "Formal RAI Details",
};

export const withdrawRaiSchema = z.object({
  additionalInformation: z.string(),
  attachments: z
    .object({
      supportingDocumentation: zAttachmentOptional,
    })
    .optional(),
});
type Attachments = keyof NonNullable<
  z.infer<typeof withdrawRaiSchema>["attachments"]
>;

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
  const modal = useModalContext();
  const { handleSubmit } = SC.useSubmitForm();
  const { id, authority } = useParams() as { id: string; authority: Authority };
  SC.useDisplaySubmissionAlert(
    "RAI response withdrawn",
    `The RAI response for ${id} has been withdrawn. CMS may follow up if additional information is needed.`
  );

  return (
    <>
      <SC.Heading title={title[authority]} />
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
        <SC.AdditionalInformation helperText="Explain your need for withdrawal." />
        <SC.FormLoadingSpinner />
        <SC.ErrorBanner />
        <AdditionalFormInformation />
        <SC.SubmissionButtons
          onSubmit={() => {
            const acceptAction = () => {
              modal.setModalOpen(false);
              handleSubmit();
            };

            modal.setContent({
              header: "Withdraw RAI response?",
              body: `The RAI response for ${id} will be withdrawn, and CMS will be notified.`,
              acceptButtonText: "Yes, withdraw response",
              cancelButtonText: "Cancel",
            });

            modal.setOnAccept(() => acceptAction);

            modal.setModalOpen(true);
          }}
        />
      </form>
    </>
  );
};

const AdditionalFormInformation = () => {
  return (
    <Alert variant={"infoBlock"} className="space-x-2 mb-8">
      <Info />
      <p>
        Once you submit this form, a confirmation email is sent to you and to
        CMS. CMS will use this content to review your package, and you will not
        be able to edit this form. If CMS needs any additional information, they
        will follow up by email.
      </p>
    </Alert>
  );
};
