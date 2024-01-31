import { Alert, SimplePageContainer } from "@/components";
import {
  Button,
  FormDescription,
  FormItem,
  FormLabel,
  RequiredIndicator,
  Textarea,
  Upload,
} from "@/components/Inputs";
import { FAQ_TAB } from "@/components/Routing/consts";
import { Info } from "lucide-react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { Form, Link, useSubmit } from "react-router-dom";
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
          <AttachmentsSection
            attachments={[{ name: "Test Attachment", required: true }]}
          />
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
    <section className="flex flex-col my-8 space-y-8">
      <div>
        <p>Package ID</p>
        <p className="text-xl">{id}</p>
      </div>
      <div>
        <p>Type</p>
        <p className="text-xl">{type}</p>
      </div>
    </section>
  );
};

const AttachmentsSection = ({
  attachments,
}: {
  attachments: { name: string; required: boolean }[];
}) => {
  return (
    <>
      <h2 className="font-bold text-2xl font-sans mb-2">Attachments</h2>
      <p>
        Maximum file size of 80 MB per attachment.{" "}
        <strong>You can add multiple files per attachment type.</strong> Read
        the description for each of the attachment types on the{" "}
        <Link
          className="text-blue-700 hover:underline"
          to={"/faq/#medicaid-spa-rai-attachments"}
          target={FAQ_TAB}
        >
          {" "}
          FAQ Page.
        </Link>
      </p>
      <p>
        We accept the following file formats:{" "}
        <strong>.docx, .jpg, .png, .pdf, .xlsx,</strong>
        and a few others. See the full list on the FAQ Page.
      </p>
      {attachments.map(({ name, required }) => (
        <FormItem key={name} className="my-4 space-y-2">
          <FormLabel>{name}</FormLabel> {required && <RequiredIndicator />}
          <Upload files={[]} setFiles={() => []} />
        </FormItem>
      ))}
    </>
  );
};

const AdditionalInformation = () => {
  return (
    <section className="my-4">
      <h2 className="font-bold text-2xl font-sans mb-2">
        Additional Information <RequiredIndicator />
      </h2>
      <FormItem>
        <FormLabel>
          <p>Add anything else that you would like to share with the State.</p>
        </FormLabel>
        <Textarea className="h-[200px] resize-none" />
        <FormDescription>4,000 characters allowed</FormDescription>
      </FormItem>
    </section>
  );
};

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

const SubmissionButtons = () => {
  return (
    <section className="space-x-2 mb-8">
      <Button type="submit">Submit</Button>
      <Button variant={"outline"} type="reset">
        Cancel
      </Button>
    </section>
  );
};

const RequiredFieldDescription = () => {
  return (
    <p>
      <span className="text-red-500">*</span> Indicates a required field
    </p>
  );
};

const ActionDescription = ({ children }: { children: React.ReactNode }) => {
  return <p className="font-light mb-6 max-w-4xl">{children}</p>;
};
