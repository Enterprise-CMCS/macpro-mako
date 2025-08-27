import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import { DefaultValues, FieldPath, useForm, UseFormReturn } from "react-hook-form";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { Authority, UserDetails } from "shared-types";
import { isStateUser } from "shared-utils";
import { z } from "zod";

import { useGetUserDetails } from "@/api";
import {
  ActionFormDescription,
  Banner,
  banner,
  BreadCrumbs,
  Button,
  FAQFooter,
  Form,
  FormField,
  LoadingSpinner,
  optionCrumbsFromPath,
  PreSubmissionMessage,
  RequiredFieldDescription,
  RequiredIndicator,
  SectionCard,
  SimplePageContainer,
  UserPrompt,
  userPrompt,
} from "@/components";
import { useNavigationPrompt } from "@/hooks";
import { getFormOrigin, queryClient } from "@/utils";
import { CheckDocumentFunction, documentPoller } from "@/utils/Poller/documentPoller";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

import { mapSubmissionTypeBasedOnActionFormTitle } from "../../utils/ReactGA/Mapper";
import { getAttachments } from "./actionForm.utilities";
import { ActionFormAttachments, AttachmentsOptions } from "./ActionFormAttachments";
import { AdditionalInformation } from "./AdditionalInformation";

type EnforceSchemaProps<Shape extends z.ZodRawShape> = z.ZodObject<
  Shape & {
    attachments?: z.ZodObject<{
      [Key in keyof Shape]: z.ZodObject<{
        label: z.ZodDefault<z.ZodString>;
        files: z.ZodArray<z.ZodTypeAny, "many"> | z.ZodOptional<z.ZodArray<z.ZodTypeAny, "many">>;
      }>;
    }>;
  },
  "strip",
  z.ZodTypeAny
>;

export type SchemaWithEnforcableProps<Shape extends z.ZodRawShape = z.ZodRawShape> =
  | z.ZodEffects<EnforceSchemaProps<Shape>>
  | EnforceSchemaProps<Shape>;

export type InferUntransformedSchema<T> = T extends z.ZodEffects<infer U> ? U : T;

export type FormArg<Schema extends SchemaWithEnforcableProps> = UseFormReturn<
  z.infer<InferUntransformedSchema<Schema>>
>;

type ActionFormProps<Schema extends SchemaWithEnforcableProps> = {
  schema: Schema;
  defaultValues?: DefaultValues<z.infer<InferUntransformedSchema<Schema>>>;
  title: string;
  fields: (form: FormArg<Schema>) => ReactNode;
  submitButtonLabel?: string;
  bannerPostSubmission?: Omit<Banner, "pathnameToDisplayOn">;
  promptPreSubmission?: Omit<UserPrompt, "onAccept">;
  promptOnLeavingForm?: Omit<UserPrompt, "onAccept">;
  attachments?: AttachmentsOptions;
  additionalInformation?:
    | {
        required: boolean;
        title: string;
        label: string;
      }
    | false;
  documentPollerArgs: {
    property: (keyof z.TypeOf<Schema> & string) | ((values: z.TypeOf<Schema>) => string);
    documentChecker: CheckDocumentFunction;
  };
  conditionsDeterminingUserAccess?: ((user: UserDetails | null) => boolean)[];
  breadcrumbText: string;
  formDescription?: string | React.ReactNode;
  preSubmissionMessage?: string;
  showPreSubmissionMessage?: boolean;
  areFieldsRequired?: boolean;
  showFAQFooter?: boolean;
  footer?: (args: {
    form: FormArg<Schema>;
    onSubmit: () => void;
    onCancel: (promptOverride?: Partial<Omit<UserPrompt, "onAccept">>) => void;
  }) => ReactNode;
};

export const ActionForm = <Schema extends SchemaWithEnforcableProps>({
  schema,
  defaultValues = {} as DefaultValues<z.TypeOf<InferUntransformedSchema<Schema>>>,
  title,
  fields: Fields,
  submitButtonLabel = "Submit",
  bannerPostSubmission = {
    header: "Package submitted",
    body: "Your submission has been received.",
    variant: "success",
  },
  promptOnLeavingForm = {
    header: "Stop form submission?",
    body: "All information you've entered on this form will be lost if you leave this page.",
    acceptButtonText: "Yes, leave form",
    cancelButtonText: "Return to form",
    areButtonsReversed: true,
  },
  promptPreSubmission,
  documentPollerArgs,
  attachments,
  conditionsDeterminingUserAccess = [isStateUser],
  breadcrumbText,
  formDescription = `Once you submit this form, a confirmation email is sent to you and to CMS.
      CMS will use this content to review your package, and you will not be able
      to edit this form. If CMS needs any additional information, they will
      follow up by email.`,
  preSubmissionMessage,
  additionalInformation = {
    required: false,
    label: "Add anything else you would like to share with CMS.",
    title: "Additional Information",
  },
  showPreSubmissionMessage = true,
  areFieldsRequired = true,
  showFAQFooter = true,
  footer: Footer,
}: ActionFormProps<Schema>) => {
  const { id, authority } = useParams<{
    id: string;
    authority: Authority;
    type: string;
  }>();
  const { pathname } = useLocation();
  const startTimePage = Date.now();

  const navigate = useNavigate();
  const { data: userObj, isLoading: isUserLoading } = useGetUserDetails();
  const skipNavigationPromptRef = useRef(false);

  const breadcrumbs = optionCrumbsFromPath(pathname, authority, id);

  const form = useForm<z.TypeOf<Schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      ...defaultValues,
    },
  });

  const hasRealChanges = Object.keys(form.formState.dirtyFields).length > 0;

  useNavigationPrompt({
    shouldBlock: hasRealChanges && !form.formState.isSubmitting,
    prompt: promptOnLeavingForm,
    shouldSkipBlockingRef: skipNavigationPromptRef,
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty && !form.formState.isSubmitting) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty, form.formState.isSubmitting]);

  useEffect(() => {
    if (typeof window.gtag == "function") {
      const submissionType = mapSubmissionTypeBasedOnActionFormTitle(title);
      sendGAEvent("submit_page_open", { submission_type: submissionType ? submissionType : title });
    }
  }, [title]);

  const { mutateAsync } = useMutation({
    mutationFn: (formData: z.TypeOf<Schema>) =>
      API.post("os", "/submit", {
        body: formData,
      }),
  });

  const onSubmit = form.handleSubmit(async (formData) => {
    try {
      try {
        await mutateAsync(formData);
      } catch (error) {
        throw Error(`Error submitting form: ${error?.message || error}`);
      }

      const { documentChecker, property } = documentPollerArgs;

      const documentPollerId =
        typeof property === "function" ? property(formData) : formData[property];

      try {
        const poller = documentPoller(documentPollerId, documentChecker);
        await poller.startPollingData();
      } catch (error) {
        throw Error(`${error?.message || error}`);
      }

      const formOrigins = getFormOrigin({ authority, id });

      banner({
        ...bannerPostSubmission,
        pathnameToDisplayOn: formOrigins.pathname,
      });

      await queryClient.invalidateQueries({ queryKey: ["record"] });
      navigate(formOrigins);

      const timeOnPageSec = (Date.now() - startTimePage) / 1000;

      sendGAEvent("submission_submit_click", { package_type: formData.event, package_id: id });
      sendGAEvent("submit_page_exit", {
        submission_type: formData.event,
        time_on_page_sec: timeOnPageSec,
      });
      if (formData.event == "upload-subsequent-documents") {
        sendGAEvent("upload-subsequent-documents", { package_id: id });
      } else if (formData.event == "withdraw-package") {
        sendGAEvent("withdraw-package", { package_id: id });
      }
    } catch (error) {
      console.error(error);
      banner({
        header: "An unexpected error has occurred:",
        body: error instanceof Error ? error.message : String(error),
        variant: "destructive",
        pathnameToDisplayOn: window.location.pathname,
      });
      window.scrollTo(0, 0);
    }
  });

  const attachmentsFromSchema = useMemo(() => getAttachments(schema), [schema]);

  const handleCancel = (promptOverride?: Partial<Omit<UserPrompt, "onAccept">>) => {
    skipNavigationPromptRef.current = true;

    userPrompt({
      ...promptOnLeavingForm,
      ...promptOverride,
      onAccept: () => {
        const origin = getFormOrigin({ id, authority });
        navigate(origin);
      },
    });

    const timeOnPageSec = (Date.now() - startTimePage) / 1000;
    sendGAEvent("submit_cancel", {
      submission_type: title,
      time_on_page_sec: timeOnPageSec,
    });
  };

  if (isUserLoading === true) {
    return <LoadingSpinner />;
  }

  const doesUserHaveAccessToForm = conditionsDeterminingUserAccess.some((condition) =>
    condition(userObj || null),
  );

  if (!userObj || doesUserHaveAccessToForm === false) {
    return <Navigate to="/" replace />;
  }

  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={[
          ...breadcrumbs,
          {
            to: pathname,
            displayText: breadcrumbText,
            order: breadcrumbs.length,
          },
        ]}
      />
      {form.formState.isSubmitting && <LoadingSpinner />}
      <Form {...form}>
        <form onSubmit={onSubmit} className="my-6 space-y-8 mx-auto justify-center flex flex-col">
          <SectionCard testId="detail-section" title={title}>
            <div>
              {areFieldsRequired && <RequiredFieldDescription />}
              <ActionFormDescription boldReminder={areFieldsRequired}>
                {formDescription}
              </ActionFormDescription>
            </div>
            <Fields {...form} />
          </SectionCard>
          {attachmentsFromSchema.length > 0 && (
            <ActionFormAttachments
              attachmentsFromSchema={attachmentsFromSchema}
              {...attachments}
              type={title}
            />
          )}
          {additionalInformation && (
            <SectionCard
              testId="additional-info"
              title={
                <>
                  {additionalInformation.title}{" "}
                  {additionalInformation.required && <RequiredIndicator />}
                </>
              }
            >
              <FormField
                control={form.control}
                name={"additionalInformation" as FieldPath<z.TypeOf<Schema>>}
                render={({ field }) => (
                  <AdditionalInformation
                    label={additionalInformation.label}
                    field={field}
                    submissionTitle={title}
                  />
                )}
              />
            </SectionCard>
          )}
          {showPreSubmissionMessage && (
            <PreSubmissionMessage
              hasProgressLossReminder={areFieldsRequired}
              preSubmissionMessage={preSubmissionMessage}
            />
          )}
          {Footer ? (
            <Footer form={form} onSubmit={onSubmit} onCancel={handleCancel} />
          ) : (
            <section className="flex justify-end gap-2 p-4 ml-auto">
              <Button
                className="px-12"
                type={promptPreSubmission ? "button" : "submit"}
                onClick={
                  promptPreSubmission
                    ? () => userPrompt({ ...promptPreSubmission, onAccept: onSubmit })
                    : undefined
                }
                disabled={!form.formState.isValid}
                aria-disabled={!form.formState.isValid}
                data-testid="submit-action-form"
              >
                {submitButtonLabel}
              </Button>
              <Button
                className="px-12"
                onClick={() => handleCancel()}
                variant="outline"
                type="reset"
                data-testid="cancel-action-form"
              >
                Cancel
              </Button>
            </section>
          )}
        </form>
      </Form>
      {showFAQFooter && <FAQFooter />}
    </SimplePageContainer>
  );
};
