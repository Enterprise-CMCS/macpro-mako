import { Alert, SimplePageContainer } from "@/components";
import * as UI from "@/components/Inputs";
import { FAQ_TAB } from "@/components/Routing/consts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Info } from "lucide-react";
import {
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import * as SC from "./shared-components";

type IssueRaiSubmitHandler = SubmitHandler<z.infer<typeof issueRaiFormSchema>>;

const issueRaiFormSchema = z.object({
  additionalInformation: z.string().min(10),
});

// we're going to simplify things (react-hook-form) is now only responsible for validation
// react router is global. it will now handle routing and form submitting data to backend

const useTypeSafeContext = () =>
  useFormContext<z.infer<typeof issueRaiFormSchema>>();
const useTypeSafeForm = () =>
  useForm<z.infer<typeof issueRaiFormSchema>>({
    resolver: zodResolver(issueRaiFormSchema),
  });

export const IssueRai = () => {
  const methods = useTypeSafeForm();

  const submitHandler: IssueRaiSubmitHandler = async (data) => {
    console.log(data);
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
      <PackageSection id="test-spa-id" type="medicaid spa" />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(submitHandler)}>
          <SC.AttachmentsSection
            attachments={[
              { name: "Formal RAI Letter", required: true },
              { name: "Other", required: false },
            ]}
          />
          <AdditionalInformation />
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

const AdditionalInformation = () => {
  const form = useTypeSafeContext();
  return (
    <section className="my-4">
      <h2 className="font-bold text-2xl font-sans mb-2">
        Additional Information <UI.RequiredIndicator />
      </h2>
      <UI.FormField
        control={form.control}
        name="additionalInformation"
        render={({ field }) => (
          <UI.FormItem>
            <UI.FormLabel>
              <p>
                Add anything else that you would like to share with the State.
              </p>
            </UI.FormLabel>
            <UI.Textarea {...field} className="h-[200px] resize-none" />
            <UI.FormMessage />
            <UI.FormDescription>4,000 characters allowed</UI.FormDescription>
          </UI.FormItem>
        )}
      />
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
