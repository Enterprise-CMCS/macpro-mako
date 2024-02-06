import { Alert, SimplePageContainer } from "@/components";
import * as SC from "./shared-components";
import { ActionFunction, ActionFunctionArgs } from "react-router-dom";
import { z } from "zod";
import { Info } from "lucide-react";
import { submit } from "@/api/submissionService";
import { getUser } from "@/api/useGetUser";
import { PlanType } from "shared-types";

export const issueRaiSchema = z.object({
  additionalInformation: z.string(),
});

export const issueRaiDefaultAction: ActionFunction = async ({ request }) => {
  try {
    const data = issueRaiSchema.parse(
      Object.fromEntries(await request.formData())
    );

    const user = await getUser();
    const authority = PlanType["1915(b)"];
    // await submit({ data, endpoint: "/action/issue-rai", user, authority });
  } catch (err) {
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
        <SC.AttachmentsSection
          attachments={[
            { name: "Formal RAI Letter", required: true },
            { name: "Other", required: false },
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
