import { ReactNode } from "react";
import {
  Banner,
  Button,
  UserPrompt,
  SimplePageContainer,
  BreadCrumbs,
  Form,
  LoadingSpinner,
  SectionCard,
  FormIntroText,
  FormField,
  banner,
  userPrompt,
  formCrumbsFromPath,
} from "@/components";
import {
  DefaultValues,
  FieldPath,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SlotAdditionalInfo } from "@/features";
import { getFormOrigin } from "@/utils";
import {
  CheckDocumentFunction,
  documentPoller,
} from "@/utils/Poller/documentPoller";
import { API } from "aws-amplify";
import { Authority } from "shared-types";
import {
  ActionFormAttachments,
  SchemaWithEnforcableProps,
} from "./ActionFormAttachments";

type ActionFormProps<Schema extends SchemaWithEnforcableProps<z.ZodRawShape>> =
  {
    schema: Schema;
    defaultValues?: DefaultValues<z.TypeOf<Schema>>;
    title: string;
    fieldsLayout?: ({ children }: { children: ReactNode }) => ReactNode;
    fields: (form: UseFormReturn<z.TypeOf<Schema>>) => ReactNode[];
    bannerPostSubmission: Omit<Banner, "pathnameToDisplayOn">;
    promptPreSubmission?: Omit<UserPrompt, "onAccept">;
    promptOnLeavingForm?: Omit<UserPrompt, "onAccept">;
    attachments: {
      faqLink: string;
      specialInstructions?: string;
      fileInstructions: {
        [Key in keyof z.TypeOf<Schema>["attachments"]]: string;
      };
    };
    documentPollerArgs: {
      property: keyof z.TypeOf<Schema> & string;
      documentChecker: CheckDocumentFunction;
    };
    footer?: () => ReactNode;
  };

export const ActionForm = <
  Schema extends SchemaWithEnforcableProps<z.ZodRawShape>,
>({
  schema,
  defaultValues,
  title,
  fields: Fields,
  fieldsLayout: FieldsLayout,
  bannerPostSubmission,
  promptOnLeavingForm,
  promptPreSubmission,
  documentPollerArgs,
  attachments,
  footer: Footer,
}: ActionFormProps<Schema>) => {
  const { id, authority } = useParams<{ id: string; authority: Authority }>();
  const location = useLocation();
  const navigate = useNavigate();

  const form = useForm<z.TypeOf<Schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      ...defaultValues,
    },
  });

  const onSubmit = form.handleSubmit(async (formData) => {
    try {
      await API.post("os", "/submit", {
        body: formData,
      });

      documentPoller(
        documentPollerArgs.property,
        documentPollerArgs.documentChecker,
      );

      const formOrigins = getFormOrigin();
      banner({
        ...bannerPostSubmission,
        pathnameToDisplayOn: formOrigins.pathname,
      });

      navigate(formOrigins);
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

  return (
    <SimplePageContainer>
      <BreadCrumbs options={formCrumbsFromPath(location.pathname)} />
      {form.formState.isSubmitting && <LoadingSpinner />}
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="my-6 space-y-8 mx-auto justify-center flex flex-col"
        >
          {FieldsLayout ? (
            <FieldsLayout>
              <Fields {...form} />
            </FieldsLayout>
          ) : (
            <SectionCard title={title}>
              <FormIntroText />
              <Fields {...form} />
            </SectionCard>
          )}
          {schema.shape.attachments && (
            <ActionFormAttachments schema={schema} {...attachments} />
          )}
          {schema.shape.additionalInformation && (
            <SectionCard title="Additional Information">
              <FormField
                control={form.control}
                name={"additionalInformation" as FieldPath<z.TypeOf<Schema>>}
                render={SlotAdditionalInfo({
                  withoutHeading: true,
                  label: (
                    <p>Add anything else you would like to share with CMS</p>
                  ),
                })}
              />
            </SectionCard>
          )}
          <section className="flex justify-end gap-2 p-4 ml-auto">
            <Button
              className="px-12"
              type={promptPreSubmission ? "button" : "submit"}
              onClick={
                promptPreSubmission
                  ? () =>
                      userPrompt({ ...promptPreSubmission, onAccept: onSubmit })
                  : undefined
              }
              disabled={form.formState.isValid === false}
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
        </form>
      </Form>
      {Footer && <Footer />}
    </SimplePageContainer>
  );
};
