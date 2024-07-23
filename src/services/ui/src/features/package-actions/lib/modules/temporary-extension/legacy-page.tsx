/** This page exists, with as little duplicate code as possible, to fulfil
 * the need for TEs to be accessed via the New Submission path. TEs as actions
 * are using the same underlying components, but are structured in an updated
 * pattern that New Submissions will later be adapted to use */
import { unflatten } from "flat";
import { defaultTempExtSchema } from ".";
import { getUser, submit } from "@/api";
import { SeatoolAuthority } from "shared-types";
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
  useLocationCrumbs,
  FormLoadingSpinner,
  ProgressLossReminder,
  FAQFooter,
} from "@/components";
import { useParams } from "react-router-dom";
import {
  ActionFunction,
  useDisplaySubmissionAlert,
  useSubmitForm,
} from "@/features/package-actions/legacy-shared-components";
import { Info } from "lucide-react";
import { useMemo } from "react";
import { documentPoller } from "@/utils/Poller/documentPoller";
import { isNewSubmission } from "@/utils";
import { SubmitAndCancelBtnSection } from "@/features/submission/waiver/shared-components";

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
      // REFACTOR: either check if data.authority is SeatoolAuthority or type it out correctly
      authority: data.authority as SeatoolAuthority,
    });

    await documentPoller(data.id, (data) => !!data).startPollingData();

    return {
      submitted: true,
      isTe: true,
    };
  } catch (err) {
    console.log(err);
    return { submitted: false, error: err };
  }
};

export const TempExtensionWrapper = () => {
  const methods = useForm({
    resolver: zodResolver(defaultTempExtSchema),
    mode: "onChange",
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
  const { id, authority } = useParams<{ id: string; authority: string }>();

  const navigationLocation = useMemo(
    () =>
      isNewSubmission()
        ? "/dashboard?tab=waivers"
        : `/details/${authority}/${id}`,
    [id, authority],
  );

  const { handleSubmit, formMethods } = useSubmitForm();
  formMethods.setValue("seaActionType", "Extend");

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
            information, they will follow up by email.
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
          <div>
            Once you submit this form, a confirmation email is sent to you and
            to CMS. CMS will use this content to review your package, and you
            will not be able to edit this form. If CMS needs any additional
            information, they will follow up by email.
            <ProgressLossReminder />
          </div>
        </Alert>
        <FormLoadingSpinner />
        <ErrorBanner />
        <SubmitAndCancelBtnSection
          cancelNavigationLocation={navigationLocation}
        />
      </form>
      <FAQFooter />
    </SimplePageContainer>
  );
};
