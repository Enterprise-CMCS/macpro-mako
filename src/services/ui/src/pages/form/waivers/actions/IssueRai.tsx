import { Alert } from "@/components";
import * as SC from "./shared-components";
import { ActionFunction, Form } from "react-router-dom";
import { z } from "zod";
import { Info } from "lucide-react";
import { submit } from "@/api/submissionService";
import { getUser } from "@/api/useGetUser";
import { PlanType } from "shared-types";
import { zAttachmentOptional, zAttachmentRequired } from "../../zod";
import { unflatten } from "flat";

type Attachments = keyof z.infer<typeof issueRaiSchema>["attachments"];
export const issueRaiSchema = z.object({
  additionalInformation: z.string(),
  attachments: z.object({
    formalRaiLetter: zAttachmentRequired({ min: 1 }),
    other: zAttachmentOptional,
  }),
});

export const issueRaiDefaultAction: ActionFunction = async ({ request }) => {
  try {
    const formData = Object.fromEntries(await request.formData());

    const unflattenedFormData = unflatten(formData);

    const data = issueRaiSchema.parse(unflattenedFormData);

    const user = await getUser();
    const authority = PlanType["1915b"];
    // await submit({ data, endpoint: "/action/issue-rai", user, authority });

    console.log(data);
  } catch (err) {
    console.log(err);
    throw new Error("Submission Failed");
  }

  return null;
};

export const IssueRai = () => {
  const { handleSubmit } = SC.useSubmitForm();

  return (
    <>
      <SC.Heading title="Formal RAI Details" />
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
      <SC.PackageSection id="test-spa-id" type="medicaid spa" />
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
