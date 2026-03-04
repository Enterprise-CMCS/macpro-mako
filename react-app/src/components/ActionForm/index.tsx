import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DefaultValues, FieldPath, useForm, UseFormReturn } from "react-hook-form";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { Authority, SEATOOL_STATUS, UserDetails } from "shared-types";
import { isStateUser } from "shared-utils";
import { z } from "zod";

import { saveDraft, useGetItem, useGetUserDetails } from "@/api";
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
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
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

export type ActionFormFieldsArg<Schema extends SchemaWithEnforcableProps> = FormArg<Schema> & {
  isDraftMode: boolean;
};

type DraftOptions = {
  enabled: boolean;
  event: string;
  idPath?: string;
  authorityPath?: string;
};

type ActionFormProps<Schema extends SchemaWithEnforcableProps> = {
  schema: Schema;
  defaultValues?: DefaultValues<z.infer<InferUntransformedSchema<Schema>>>;
  title: string;
  fields: (form: ActionFormFieldsArg<Schema>) => ReactNode;
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
    onSaveDraft?: () => void;
    isDraftMode?: boolean;
  }) => ReactNode;
  draftOptions?: DraftOptions;
};

const getValueByPath = (values: Record<string, unknown>, path: string) => {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, values);
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
  draftOptions,
}: ActionFormProps<Schema>) => {
  const { id, authority } = useParams<{
    id: string;
    authority: Authority;
    type: string;
  }>();
  const { pathname, search } = useLocation();
  const startTimePage = Date.now();
  const effectiveSubmitButtonLabel =
    draftOptions?.enabled && submitButtonLabel === "Submit" ? "Save & Submit" : submitButtonLabel;

  const navigate = useNavigate();
  const { data: userObj, isLoading: isUserLoading } = useGetUserDetails();
  const skipNavigationPromptRef = useRef(false);
  const isStickyFooterEnabled = useFeatureFlag("STICKY_FORM_FOOTER");
  const [footerTriggerElement, setFooterTriggerElement] = useState<HTMLDivElement | null>(null);
  const [isFooterFixed, setIsFooterFixed] = useState(false);
  const [hasConfirmedNonOwnerDraftAction, setHasConfirmedNonOwnerDraftAction] = useState(false);
  const hasPromptedNonOwnerDraftActionRef = useRef(false);
  const draftVersionRef = useRef<{ seqNo?: number; primaryTerm?: number }>({});
  const saveDraftInFlightRef = useRef(false);

  const breadcrumbs = optionCrumbsFromPath(pathname, authority, id);
  const draftEnabled = draftOptions?.enabled === true;
  const rawDraftId = draftEnabled ? new URLSearchParams(search).get("draftId") : null;
  const draftId = rawDraftId ? rawDraftId.toUpperCase() : null;
  const isDraftMode = draftEnabled && !!draftId;
  const hasAppliedDraftRef = useRef(false);

  const {
    data: draftRecord,
    isLoading: isDraftLoading,
    error: draftError,
  } = useGetItem(draftId ?? "", { enabled: isDraftMode }, { includeDraft: true });
  const draftOriginalCreatorEmail =
    draftRecord?._source?.draft?.originalCreatorEmail ?? draftRecord?._source?.submitterEmail;
  const draftPackageIdForWarning = draftRecord?._source?.id ?? draftId ?? id ?? "this package";
  const isNonOwnerDraftUser = Boolean(
    isDraftMode &&
      draftOriginalCreatorEmail &&
      userObj?.email &&
      draftOriginalCreatorEmail.toLowerCase() !== userObj.email.toLowerCase(),
  );

  const navigateAwayFromDraft = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(getFormOrigin({ id, authority }));
  }, [navigate, id, authority]);

  const promptNonOwnerDraftAction = useCallback(() => {
    userPrompt({
      header: "Confirm action",
      body: `Since you are not the original package creator, are you sure you want to take this action on ${draftPackageIdForWarning}?`,
      acceptButtonText: "Yes, continue",
      cancelButtonText: "Cancel",
      cancelVariant: "link",
      onAccept: () => {
        setHasConfirmedNonOwnerDraftAction(true);
      },
      onCancel: navigateAwayFromDraft,
    });
  }, [draftPackageIdForWarning, navigateAwayFromDraft]);

  useEffect(() => {
    // Reset one-time prompt bypass after URL/search updates.
    skipNavigationPromptRef.current = false;
  }, [search]);

  const form = useForm<z.TypeOf<Schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (!isDraftMode) {
      hasAppliedDraftRef.current = false;
      hasPromptedNonOwnerDraftActionRef.current = false;
      setHasConfirmedNonOwnerDraftAction(false);
      draftVersionRef.current = {};
      return;
    }
    hasAppliedDraftRef.current = false;
    hasPromptedNonOwnerDraftActionRef.current = false;
    setHasConfirmedNonOwnerDraftAction(false);
    draftVersionRef.current = {};
  }, [draftId, isDraftMode]);

  useEffect(() => {
    if (!isDraftMode || !draftRecord) {
      return;
    }

    if (typeof draftRecord._seq_no === "number" && typeof draftRecord._primary_term === "number") {
      draftVersionRef.current = {
        seqNo: draftRecord._seq_no,
        primaryTerm: draftRecord._primary_term,
      };
    }
  }, [draftRecord, isDraftMode]);

  useEffect(() => {
    if (!isNonOwnerDraftUser || hasConfirmedNonOwnerDraftAction) {
      return;
    }

    if (hasPromptedNonOwnerDraftActionRef.current) {
      return;
    }

    hasPromptedNonOwnerDraftActionRef.current = true;
    promptNonOwnerDraftAction();
  }, [hasConfirmedNonOwnerDraftAction, isNonOwnerDraftUser, promptNonOwnerDraftAction]);

  const canProceedWithNonOwnerDraftAction = () => {
    if (!isNonOwnerDraftUser || hasConfirmedNonOwnerDraftAction) {
      return true;
    }

    if (!hasPromptedNonOwnerDraftActionRef.current) {
      hasPromptedNonOwnerDraftActionRef.current = true;
      promptNonOwnerDraftAction();
    }

    return false;
  };

  useEffect(() => {
    const draftData = draftRecord?._source?.draft?.data as
      | DefaultValues<z.infer<InferUntransformedSchema<Schema>>>
      | undefined;

    if (!draftData || hasAppliedDraftRef.current) return;

    form.reset({ ...defaultValues, ...draftData });
    hasAppliedDraftRef.current = true;
  }, [draftRecord, defaultValues, form]);

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

  const { mutateAsync: saveDraftAsync, isLoading: isSavingDraft } = useMutation({
    mutationFn: (payload: { id: string; event: string; authority?: string; draftData: any }) =>
      saveDraft(payload),
  });

  const onSubmit = form.handleSubmit(async (formData) => {
    if (!canProceedWithNonOwnerDraftAction()) {
      return;
    }

    try {
      try {
        await mutateAsync(formData);
      } catch (error) {
        if (error?.response?.status === 413) {
          throw Error(
            "Upload failed: Your submission is too large. Try uploading fewer files at a time or shortening long file names.",
          );
        }

        throw Error(`Error submitting form: ${error?.message || error}`);
      }

      const { documentChecker, property } = documentPollerArgs;
      const effectiveDocumentChecker = isDraftMode
        ? (check: Parameters<typeof documentChecker>[0]) =>
            documentChecker(check) && !check.hasStatus(SEATOOL_STATUS.DRAFT)
        : documentChecker;

      const documentPollerId =
        typeof property === "function" ? property(formData) : formData[property];

      try {
        const poller = documentPoller(documentPollerId, effectiveDocumentChecker, {
          includeDraft: isDraftMode,
        });
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

  const handleSaveDraft = async () => {
    if (!draftEnabled || !draftOptions?.event) return;
    if (saveDraftInFlightRef.current) return;
    if (!canProceedWithNonOwnerDraftAction()) return;

    saveDraftInFlightRef.current = true;
    try {
      const idPath = draftOptions.idPath ?? "id";
      const shouldValidateIdField = !isDraftMode;
      if (shouldValidateIdField) {
        const isIdValid = await form.trigger(idPath as FieldPath<z.TypeOf<Schema>>);

        if (!isIdValid) {
          banner({
            header: "Unable to save draft",
            body: "Please enter a valid ID before saving.",
            variant: "destructive",
            pathnameToDisplayOn: window.location.pathname,
          });
          return;
        }
      }

      const formValues = form.getValues();
      const idValue = getValueByPath(formValues as Record<string, unknown>, idPath);
      const idFromForm = typeof idValue === "string" ? idValue.trim() : "";
      const fallbackDraftId = isDraftMode ? draftId : undefined;
      const resolvedId = idFromForm || fallbackDraftId;

      if (!resolvedId) {
        banner({
          header: "Unable to save draft",
          body: "Please enter a valid ID before saving.",
          variant: "destructive",
          pathnameToDisplayOn: window.location.pathname,
        });
        return;
      }

      const normalizedId = resolvedId.toUpperCase();
      const authorityPath = draftOptions.authorityPath ?? "authority";
      const authorityValue = getValueByPath(formValues as Record<string, unknown>, authorityPath);
      const draftVersionPayload =
        isDraftMode &&
        typeof draftVersionRef.current.seqNo === "number" &&
        typeof draftVersionRef.current.primaryTerm === "number"
          ? {
              ifSeqNo: draftVersionRef.current.seqNo,
              ifPrimaryTerm: draftVersionRef.current.primaryTerm,
            }
          : {};

      const saveResponse = await saveDraftAsync({
        id: normalizedId,
        event: draftOptions.event,
        authority: typeof authorityValue === "string" ? authorityValue : undefined,
        draftData: formValues as Record<string, unknown>,
        ...draftVersionPayload,
      });

      if (
        typeof saveResponse?.seqNo === "number" &&
        typeof saveResponse?.primaryTerm === "number"
      ) {
        draftVersionRef.current = {
          seqNo: saveResponse.seqNo,
          primaryTerm: saveResponse.primaryTerm,
        };
      }

      banner({
        header: "Progress saved",
        body: `Changes made to ${normalizedId} have been saved.`,
        variant: "success",
        pathnameToDisplayOn: window.location.pathname,
      });

      form.reset(formValues);

      if (!rawDraftId || rawDraftId.toUpperCase() !== normalizedId) {
        const nextSearch = new URLSearchParams(search);
        nextSearch.set("draftId", normalizedId);
        skipNavigationPromptRef.current = true;
        navigate(`${pathname}?${nextSearch.toString()}`, { replace: true });
      }
    } catch (error) {
      banner({
        header: "Unable to save draft",
        body: error instanceof Error ? error.message : String(error),
        variant: "destructive",
        pathnameToDisplayOn: window.location.pathname,
      });
    } finally {
      saveDraftInFlightRef.current = false;
    }
  };

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

  const getStickyCancelPromptOverride = (): Partial<Omit<UserPrompt, "onAccept">> => {
    const idPath = draftOptions?.idPath ?? "id";
    const idValue = getValueByPath(form.getValues() as Record<string, unknown>, idPath);
    const trimmedId = typeof idValue === "string" ? idValue.trim() : "";

    return {
      header: "Leave this page?",
      body: `Unsaved changes${trimmedId ? ` to ${trimmedId}` : ""} will be discarded. Go back to save your changes.`,
      acceptButtonText: "Yes, leave",
      cancelButtonText: "Go back",
      areButtonsReversed: true,
      cancelVariant: "link" as const,
    };
  };

  useEffect(() => {
    if (!isStickyFooterEnabled || !footerTriggerElement) {
      setIsFooterFixed(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterFixed(!entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(footerTriggerElement);
    return () => observer.disconnect();
  }, [footerTriggerElement, isStickyFooterEnabled]);

  if (isUserLoading === true) {
    return <LoadingSpinner />;
  }

  if (isDraftMode && isDraftLoading) {
    return <LoadingSpinner />;
  }

  if (
    isDraftMode &&
    (draftError || !draftRecord || draftRecord._source?.seatoolStatus !== SEATOOL_STATUS.DRAFT)
  ) {
    return <Navigate to="/dashboard" replace />;
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
            <Fields {...form} isDraftMode={isDraftMode} />
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
            <Footer
              form={form}
              onSubmit={onSubmit}
              onCancel={handleCancel}
              onSaveDraft={draftEnabled ? handleSaveDraft : undefined}
              isDraftMode={isDraftMode}
            />
          ) : isStickyFooterEnabled ? (
            <section>
              <div ref={setFooterTriggerElement} />
              <section
                className={
                  isFooterFixed
                    ? "fixed bottom-0 left-0 w-full z-40 border-t border-gray-300 bg-white px-6"
                    : "flex flex-col md:flex-row justify-between items-center gap-4 p-4 w-full"
                }
                data-testid="action-form-footer"
              >
                <div className="flex justify-between items-center w-full py-3">
                  <button
                    onClick={() => handleCancel(getStickyCancelPromptOverride())}
                    data-testid="cancel-action-form"
                    className="w-24 py-3 px-5 text-blue-700 font-semibold underline"
                    type="button"
                  >
                    Cancel
                  </button>

                  <div className="flex gap-2.5">
                    {draftEnabled && (
                      <button
                        type="button"
                        className="w-[128.36px] py-3 px-5 gap-2.5 rounded border-2 border-blue-700 text-blue-700 bg-white font-semibold text-sm"
                        onClick={handleSaveDraft}
                        disabled={isSavingDraft}
                        aria-disabled={isSavingDraft}
                        data-testid="save-draft-form"
                      >
                        Save
                      </button>
                    )}
                    <button
                      type={promptPreSubmission ? "button" : "submit"}
                      onClick={
                        promptPreSubmission
                          ? () => userPrompt({ ...promptPreSubmission, onAccept: onSubmit })
                          : undefined
                      }
                      disabled={!form.formState.isValid}
                      aria-disabled={!form.formState.isValid}
                      data-testid="submit-action-form"
                      className={`w-[181.75px] py-3 px-5 gap-2.5 rounded font-semibold text-sm transition ${
                        !form.formState.isValid
                          ? "bg-gray-300 text-white cursor-not-allowed"
                          : "bg-blue-700 text-white hover:bg-blue-800"
                      }`}
                    >
                      {effectiveSubmitButtonLabel}
                    </button>
                  </div>
                </div>
              </section>
            </section>
          ) : (
            <section className="flex justify-end gap-2 p-4 ml-auto">
              {draftEnabled && (
                <Button
                  className="px-12"
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                  aria-disabled={isSavingDraft}
                  data-testid="save-draft-form"
                >
                  Save
                </Button>
              )}
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
                {effectiveSubmitButtonLabel}
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
