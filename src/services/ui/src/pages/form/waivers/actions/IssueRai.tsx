import { Alert, SimplePageContainer } from "@/components";
import * as SC from "./shared-components";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FieldValues,
  useForm,
  SubmitHandler,
  FormProvider,
} from "react-hook-form";
import { ActionFunction, redirect, useSubmit } from "react-router-dom";
import { z } from "zod";
import { Info } from "lucide-react";

const formSchema = z.object({
  additionalInformation: z.string(),
});

export const issueRaiDefaultAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const data = { ...Object.fromEntries(formData) };

  console.log(data);

  return redirect("/");
};

export const IssueRai = () => {
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const submit = useSubmit();

  const validSubmission: SubmitHandler<FieldValues> = (data, e) => {
    e?.preventDefault();

    submit(data, {
      method: "post",
    });
  };

  return (
    <SimplePageContainer>
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
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(validSubmission)}>
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
      </FormProvider>
    </SimplePageContainer>
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
