import { Alert } from "@/components";
import * as SC from "@/features/package-actions/shared-components";
import { ActionFunction, useLoaderData, useParams } from "react-router-dom";
import { z } from "zod";
import { Info } from "lucide-react";
import { getUser } from "@/api/useGetUser";
import { PlanType } from "shared-types";
import { unflatten } from "flat";
import { zAttachmentOptional, zAttachmentRequired } from "@/pages/form/zod";

type Attachments = keyof z.infer<typeof respondToRaiSchema>["attachments"];
export const respondToRaiSchema = z.object({
  additionalInformation: z.string(),
  attachments: z.object({
    raiResponseLetter: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});

export const onValidSubmission: ActionFunction = async ({ request }) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const unflattenedFormData = unflatten(formData);

    const data = respondToRaiSchema.parse(unflattenedFormData);

    const user = await getUser();
    const authority = PlanType["1915(b)"];
    // await submit({ data, endpoint: "/action/issue-rai", user, authority });

    console.log(data);
  } catch (err) {
    console.log(err);
    throw new Error("Submission Failed");
  }

  return null;
};

export const RespondToRai = () => {
  const { handleSubmit } = SC.useSubmitForm();

  return (
    <>
      <SC.Heading title="Formal RAI Details" />
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
      <SC.PackageSection id="test-spa-id" type="medicaid spa" />
      <form onSubmit={handleSubmit}>
        <SC.AttachmentsSection<Attachments>
          attachments={[
            {
              name: "RAI Response Letter",
              required: true,
              registerName: "raiResponseLetter",
            },
            { name: "Other", required: false, registerName: "other" },
          ]}
        />
        <SC.AdditionalInformation />
        <AdditionalFormInformation />
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
        will follow up by email. Submit
      </p>
    </Alert>
  );
};
