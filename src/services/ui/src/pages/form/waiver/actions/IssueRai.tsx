import { Alert, SimplePageContainer } from "@/components";
import * as UI from "@/components/Inputs";
import { zodResolver } from "@hookform/resolvers/zod";
import { UseMutateFunction, useMutation } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import * as SC from "./shared-components";
import { baseFormSchema } from "./base-form-schema";
import { usePackageActionForm } from "./package-action-form-hook";

const issueRaiFormSchema = baseFormSchema.merge(z.object({}));

export const IssueRai = () => {
  const { form, handleSubmit, isSuccess, isError } = usePackageActionForm({
    schema: issueRaiFormSchema,
    submissionPayload: (data) => ({ brian: "is testing" }),
  });

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
      <FormProvider {...form}>
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
