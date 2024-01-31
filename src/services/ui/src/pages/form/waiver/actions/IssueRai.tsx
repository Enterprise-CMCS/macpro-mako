import { SimplePageContainer } from "@/components";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { Form, useSubmit } from "react-router-dom";
import { z } from "zod";

const issueRaiFormSchema = z.object({
  additionalInformation: z.string(),
});

// we're going to simplify things (react-hook-form) is now only responsible for validation
// react router is global. it will now handle routing and form submitting data to backend

const useTypeSafeContext = () =>
  useFormContext<z.infer<typeof issueRaiFormSchema>>();
const useTypeSafeForm = () => useForm<z.infer<typeof issueRaiFormSchema>>();

export const IssueRaiAction = () => {
  console.log("something");
};

export const IssueRai = () => {
  const submit = useSubmit();
  const methods = useTypeSafeForm();

  return (
    <SimplePageContainer>
      <Heading title="Formal RAI Details" />
      <RequiredFieldDescription />
      <ActionDescription>
        Issuance of a Formal RAI in OneMAC will create a Formal RAI email sent
        to the State. This will also create a section in the package details
        summary for you and the State to have record. Please attach the Formal
        RAI Letter along with any additional information or comments in the
        provided text box. Once you submit this form, a confirmation email is
        sent to you and to the State.{" "}
        <strong>
          If you leave this page, you will lose your progress on this form.
        </strong>
      </ActionDescription>
      <PackageSection id="test-spa-id" type="medicaid spa" />
      <FormProvider {...methods}>
        <Form
          method="post"
          onSubmit={methods.handleSubmit((data, e) =>
            submit(data, e?.currentTarget)
          )}
        >
          <AttachmentsSection />
          <AdditionalInformation />
          <AdditionalFormInformation />
          <SubmissionButtons />
        </Form>
      </FormProvider>
    </SimplePageContainer>
  );
};

/**
Private Components for IssueRai
**/

const Heading = ({ title }: { title: string }) => {
  return <h1 className="text-2xl font-semibold mt-4 mb-2">{title}</h1>;
};

const PackageSection = ({ id, type }: { id: string; type: string }) => {
  return (
    <section className="flex flex-col my-8">
      <p>Package ID</p>
      <p>{id}</p>
      <p>Type</p>
      <p>{type}</p>
    </section>
  );
};

const AttachmentsSection = () => {
  return <div></div>;
};

const AdditionalInformation = () => {
  return <div></div>;
};

const AdditionalFormInformation = () => {
  return <div></div>;
};

const SubmissionButtons = () => {
  return <div></div>;
};

const RequiredFieldDescription = () => {
  return (
    <p>
      <span className="text-red-500">*</span>
      Indicates a required field
    </p>
  );
};

const ActionDescription = ({ children }: { children: React.ReactNode }) => {
  return <p className="font-light mb-6 max-w-4xl">{children}</p>;
};
