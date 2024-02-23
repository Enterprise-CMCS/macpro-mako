import { Alert } from "@/components";
import * as SC from "@/features/package-actions/shared-components";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { Info } from "lucide-react";
import { getUser } from "@/api/useGetUser";
import { Authority } from "shared-types";
import { unflatten } from "flat";
import { zAttachmentOptional, zAttachmentRequired } from "@/pages/form/zod";
import { submit } from "@/api/submissionService";

const title: Record<Authority, string> = {
  "1915(b)": "1915(b) Waiver Formal RAI Response Details",
  "1915(c)": "1915(c) Waiver Formal RAI Response Details",
  "chip spa": "Formal RAI Response Details",
  "medicaid spa": "Formal RAI Response Details",
  waiver: "Waiver Formal RAI Response Details",
};

const attachmentTitle: Record<Authority, string> = {
  "1915(b)": "Waiver RAI Response",
  "1915(c)": "Waiver RAI Response",
  "chip spa": "RAI Response",
  "medicaid spa": "RAI Response",
  waiver: "Waiver RAI Response",
};

type Attachments = keyof z.infer<typeof respondToRaiSchema>["attachments"];
export const respondToRaiSchema = z.object({
  additionalInformation: z.string().optional().default(""),
  attachments: z.object({
    raiResponseLetter: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});

export const onValidSubmission: SC.ActionFunction = async ({
  request,
  params,
}) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const unflattenedFormData = unflatten(formData);

    const data = respondToRaiSchema.parse(unflattenedFormData);

    const user = await getUser();
    const authority = Authority["1915b"];
    await submit({
      data: { ...data, id: params.id },
      endpoint: "/action/respond-to-rai",
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

export const RespondToRai = () => {
  const { handleSubmit } = SC.useSubmitForm();
  const { id, authority } = useParams() as { id: string; authority: Authority };

  SC.useDisplaySubmissionAlert(
    "RAI response submitted",
    `The RAI response for ${id} has been submitted.`
  );

  return (
    <>
      <SC.Heading title={title[authority]} />
      <SC.RequiredFieldDescription />
      <SC.ActionDescription>
        Once you submit this form, a confirmation email is sent to you and to
        CMS. CMS will use this content to review your package, and you will not
        be able to edit this form. If CMS needs any additional information, they
        will follow up by email.{" "}
        <strong>
          If you leave this page, you will lose your progress on this form.
        </strong>
      </SC.ActionDescription>
      <SC.PackageSection />
      <form onSubmit={handleSubmit}>
        <SC.AttachmentsSection<Attachments>
          attachments={[
            {
              name: attachmentTitle[authority],
              required: true,
              registerName: "raiResponseLetter",
            },
            { name: "Other", required: false, registerName: "other" },
          ]}
        />
        <SC.AdditionalInformation
          helperText="Add anything else that you would like to share with CMS."
          required={false}
        />
        <AdditionalFormInformation />
        <SC.FormLoadingSpinner />
        <SC.ErrorBanner />
        <SC.SubmissionButtons />
      </form>
    </>
  );
};

/**
Private Components for IssueRai
**/

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
