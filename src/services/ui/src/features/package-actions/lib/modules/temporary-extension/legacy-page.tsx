/** This page exists, with as little duplicate code as possible, to fulfil
 * the need for TEs to be accessed via the New Submission path. TEs as actions
 * are using the same underlying components, but are structured in an updated
 * pattern that New Submissions will later be adapted to use */
import { unflatten } from "flat";
import { defaultTempExtSchema } from ".";
import { getUser, submit } from "@/api";
import { Authority } from "shared-types";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionFormDescription,
  AdditionalInfoSection,
  Alert,
  AttachmentsSection,
  BreadCrumbs,
  ErrorBanner,
  ActionFormHeaderCard,
  SimplePageContainer,
  SubmissionButtons,
  useLocationCrumbs,
  FormLoadingSpinner,
} from "@/components";
import { useParams } from "react-router-dom";
import {
  ActionFunction,
  useDisplaySubmissionAlert,
  useSubmitForm,
} from "@/features/package-actions/legacy-shared-components";
import { Info } from "lucide-react";

export const onValidSubmission: ActionFunction = async ({ request }) => {
  try {
    const formData = Object.fromEntries(await request.formData());
    const unflattenedFormData = unflatten(formData);
    const data = await defaultTempExtSchema.parseAsync(unflattenedFormData);
    const user = await getUser();

    await submit({
      data,
      endpoint: "/submit",
      user,
      authority: data.authority as Authority,
    });

    return {
      submitted: true,
    };
  } catch (err) {
    console.log(err);
    return { submitted: false, error: err };
  }
};

export const TempExtensionWrapper = () => {
  const methods = useForm({
    resolver: zodResolver(defaultTempExtSchema),
  });
  const crumbs = useLocationCrumbs();

  return (
    <FormProvider {...methods}>
      <SimplePageContainer>
        <BreadCrumbs options={crumbs} />
      </SimplePageContainer>
      <TemporaryExtension />
    </FormProvider>
  );
};

export const TemporaryExtension = () => {
  const { handleSubmit } = useSubmitForm();
  useDisplaySubmissionAlert(
    "Temporary extension request submitted",
    "Your submission has been received.",
  );

  return (
    <SimplePageContainer>
      <form onSubmit={handleSubmit}>
        <ActionFormHeaderCard
          hasRequiredField
          title="Temporary Extension Request Details"
          isTE
        >
          <ActionFormDescription boldReminder key={"content-description"}>
            Once you submit this form, a confirmation email is sent to you and
            to CMS. CMS will use this content to review your package, and you
            will not be able to edit this form. If CMS needs any additional
            information, they will follow up by email.{" "}
          </ActionFormDescription>
        </ActionFormHeaderCard>
        <AttachmentsSection
          faqAttLink={"/faq/temporary-extensions-b-attachments"}
          key={"field-attachments"}
          attachments={[
            {
              name: "waiverExtensionRequest",
              required: true,
            },
            {
              name: "other",
              required: false,
            },
          ]}
        />
        <AdditionalInfoSection
          key={"field-addlinfo"}
          instruction={
            "Add anything else that you would like to share with CMS."
          }
        />
        <Alert variant={"infoBlock"} className="space-x-2 mb-8">
          <Info />
          <p>
            Once you submit this form, a confirmation email is sent to you and
            to CMS. CMS will use this content to review your package, and you
            will not be able to edit this form. If CMS needs any additional
            information, they will follow up by email.
          </p>
        </Alert>
        <FormLoadingSpinner />
        <ErrorBanner />
        <SubmissionButtons />
      </form>
    </SimplePageContainer>
  );
};
