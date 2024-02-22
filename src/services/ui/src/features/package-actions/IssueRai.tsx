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

type Attachments = keyof z.infer<typeof issueRaiSchema>["attachments"];
export const issueRaiSchema = z.object({
  additionalInformation: z.string(),
  attachments: z.object({
    formalRaiLetter: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});

export const issueRaiDefaultAction: SC.ActionFunction = async ({
  request,
  params,
}) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const unflattenedFormData = unflatten(formData);

    const data = issueRaiSchema.parse(unflattenedFormData);

    const user = await getUser();
    const authority = Authority["1915b"];
    await submit({
      data: { ...data, id: params.id },
      endpoint: "/action/issue-rai",
      user,
      authority,
    });

    return {
      submitted: true,
    };
  } catch (err) {
    console.log(err);
    return { submitted: false };
  }
};

export const IssueRai = () => {
  const { handleSubmit } = SC.useSubmitForm();
  const { id } = useParams();

  SC.useDisplaySubmissionAlert(
    "RAI issued",
    `The RAI for ${id} has been submitted. An email confirmation will be sent to you and the state.`
  );

  return (
    <>
      <SC.Heading title="1915(b) Waiver Formal RAI Details" />
      <SC.RequiredFieldDescription />
      <SC.ActionDescription>
        Issuance of a Formal RAI in OneMAC will create a Formal RAI email sent
        to the State. This will also create a section in the package details
        summary for you and the State to have record. Please attach the Formal
        RAI Letter along with any additional information or comments in the
        provided text box. Once you submit this form, a confirmation email is
        sent to you and to the State.{" "}
        <strong>
          If you leave this page, you will lose your progress on this form.
        </strong>
      </SC.ActionDescription>
      <SC.PackageSection />
      <form onSubmit={handleSubmit}>
        <SC.AttachmentsSection<Attachments>
          attachments={[
            {
              name: "Formal RAI Letter",
              required: true,
              registerName: "formalRaiLetter",
            },
            { name: "Other", required: false, registerName: "other" },
          ]}
        />
        <SC.AdditionalInformation />
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
        the State.
      </p>
    </Alert>
  );
};
