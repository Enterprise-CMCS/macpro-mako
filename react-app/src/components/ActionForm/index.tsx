import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactNode, useMemo } from "react";
import { DefaultValues, FieldPath, useForm, UseFormReturn } from "react-hook-form";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { Authority, CognitoUserAttributes } from "shared-types";
import { isStateUser } from "shared-utils";
import { z } from "zod";

import { useGetUser } from "@/api";
import { MedSpaFooter } from "@/components";
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
import { getFormOrigin, queryClient } from "@/utils";
import { CheckDocumentFunction, documentPoller } from "@/utils/Poller/documentPoller";
import { sendGAEvent } from "@/utils/ReactGA/sendGAEvent";

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

// Utility type to handle Zod schema with or without a transform
type InferUntransformedSchema<T> = T extends z.ZodEffects<infer U> ? U : T;

type ActionFormProps<Schema extends SchemaWithEnforcableProps> = {
  schema: Schema;
  defaultValues?: DefaultValues<z.infer<InferUntransformedSchema<Schema>>>;
  title: string;
  fields: (form: UseFormReturn<z.infer<InferUntransformedSchema<Schema>>>) => ReactNode;
  bannerPostSubmission?: Omit<Banner, "pathnameToDisplayOn">;
  promptPreSubmission?: Omit<UserPrompt, "onAccept">;
  promptOnLeavingForm?: Omit<UserPrompt, "onAccept">;
  promptOnLeavingStickyFooterForm?: Omit<UserPrompt, "onAccept">;
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
  conditionsDeterminingUserAccess?: ((user: CognitoUserAttributes | null) => boolean)[];
  breadcrumbText: string;
  formDescription?: string;
  preSubmissionMessage?: string;
  showPreSubmissionMessage?: boolean;
  areFieldsRequired?: boolean;
  showCustomFooter?: boolean;
};

export const ActionForm = <Schema extends SchemaWithEnforcableProps>({
  schema,
  defaultValues = {} as DefaultValues<z.TypeOf<InferUntransformedSchema<Schema>>>,
  title,
  fields: Fields,
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
  promptOnLeavingStickyFooterForm = {
    header: "Leave this page?",
    body: "",
    acceptButtonText: "Yes, leave",
    cancelButtonText: "Go back",
    areButtonsReversed: true,
    cancelVariant: "link",
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
    label: "",
    title: "Additional Information",
  },
  showPreSubmissionMessage = true,
  areFieldsRequired = true,
  showCustomFooter = false,
}: ActionFormProps<Schema>) => {
  const { id, authority } = useParams<{
    id: string;
    authority: Authority;
    type: string;
  }>();
  const { pathname } = useLocation();

  const navigate = useNavigate();
  const { data: userObj, isLoading: isUserLoading } = useGetUser();

  const breadcrumbs = optionCrumbsFromPath(pathname, authority, id);

  const form = useForm<z.TypeOf<Schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      ...defaultValues,
    },
  });
  const watchedId = form.watch("id" as FieldPath<z.infer<Schema>>);

  const { mutateAsync } = useMutation({
    mutationFn: (formData: z.TypeOf<Schema>) =>
      API.post("os", "/submit", {
        body: formData,
      }),
  });

  const shouldShowMedSpaFooter =
    showCustomFooter && pathname.startsWith("/new-submission/spa/medicaid");

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

      // Prevent stale data from displaying on formOrigins page
      await queryClient.invalidateQueries({ queryKey: ["record"] });
      navigate(formOrigins);

      const customUserRoles = userObj?.user?.["custom:cms-roles"];
      const customisMemberOf = userObj?.user?.["custom:ismemberof"];
      const userRoles = customUserRoles || customisMemberOf || "";
      const eventState = formData.id?.substring(0, 2);

      // send package action event
      sendGAEvent(formData.event, userRoles, eventState);
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

  if (isUserLoading === true) {
    return <LoadingSpinner />;
  }

  const doesUserHaveAccessToForm = conditionsDeterminingUserAccess.some((condition) =>
    condition(userObj?.user || null),
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
        <form
          onSubmit={(e) => {
            if (shouldShowMedSpaFooter) {
              e.preventDefault(); // Avoid duplicate submission for MedSpa
            } else {
              onSubmit(e); // Normal submission for other forms
            }
          }}
          className="my-6 space-y-8 mx-auto justify-center flex flex-col"
        >
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
            <ActionFormAttachments attachmentsFromSchema={attachmentsFromSchema} {...attachments} />
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
                  <AdditionalInformation label={additionalInformation.label} field={field} />
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
          {shouldShowMedSpaFooter && (
            <MedSpaFooter
              onCancel={() =>
                userPrompt({
                  ...promptOnLeavingStickyFooterForm,
                  body: `Unsaved changes${watchedId.trim() ? ` to ${watchedId}` : ""} will be discarded. Go back to save your changes.`,
                  onAccept: () => {
                    const origin = getFormOrigin({ id, authority });
                    navigate(origin);
                  },
                })
              }
              onSubmit={() => {
                if (promptPreSubmission) {
                  userPrompt({ ...promptPreSubmission, onAccept: onSubmit });
                } else {
                  onSubmit();
                }
              }}
              disabled={!form.formState.isValid}
            />
          )}

          {shouldShowMedSpaFooter ? (
            <section
              id="form-actions"
              className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 w-full"
            >
              <div className="w-full md:w-auto text-center md:text-left">
                <Button
                  type="reset"
                  onClick={() =>
                    userPrompt({
                      ...promptOnLeavingStickyFooterForm,
                      body: `Unsaved changes${watchedId.trim() ? ` to ${watchedId}` : ""} will be discarded. Go back to save your changes.`,
                      onAccept: () => {
                        const origin = getFormOrigin({ id, authority });
                        navigate(origin);
                      },
                    })
                  }
                  variant="outline"
                  data-testid="cancel-action-form"
                  className="text-blue-700 font-semibold underline px-0 py-0 bg-transparent shadow-none border-none hover:bg-transparent"
                >
                  Cancel
                </Button>
              </div>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto justify-center md:justify-end">
                <Button
                  type="button"
                  onClick={() => {}}
                  className="bg-white w-[113px] text-blue-700 border border-blue-700 font-semibold text-sm px-5 py-2 rounded-md hover:bg-white hover:text-blue-700 hover:border-blue-700"
                >
                  Save
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (promptPreSubmission) {
                      userPrompt({ ...promptPreSubmission, onAccept: onSubmit });
                    } else {
                      onSubmit(); // manually call submit handler
                    }
                  }}
                  disabled={!form.formState.isValid}
                  data-testid="submit-action-form"
                  className="bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-md"
                >
                  Save & Submit
                </Button>
              </div>
            </section>
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
                data-testid="submit-action-form"
              >
                Submit
              </Button>
              <Button
                className="px-12"
                onClick={() =>
                  userPrompt({
                    ...promptOnLeavingForm,
                    onAccept: () => {
                      const origin = getFormOrigin({ id, authority });
                      navigate(origin);
                    },
                  })
                }
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
      <FAQFooter />
    </SimplePageContainer>
  );
};
