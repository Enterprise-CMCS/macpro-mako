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
  FormItem,
  RequiredIndicator,
  FormLabel,
  FormMessage,
  formCrumbsFromPath,
  Upload,
} from "@/components";
import {
  DefaultValues,
  FieldPath,
  useForm,
  useFormContext,
  UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { SlotAdditionalInfo } from "@/features";
import { getFormOrigin } from "@/utils";
import {
  CheckDocumentFunction,
  documentPoller,
} from "@/utils/Poller/documentPoller";
import { API } from "aws-amplify";

type CombinedSchema<Shape extends z.ZodRawShape> = z.ZodObject<
  {
    [Key in keyof Shape]: Shape[Key];
  } & {
    attachments?: z.ZodObject<{
      [Key in keyof Shape]: z.ZodObject<{
        label: z.ZodLiteral<string>;
        files: z.ZodTypeAny;
      }>;
    }>;
    additionalInformation?: z.ZodDefault<z.ZodNullable<z.ZodString>>;
  },
  "strip",
  z.ZodTypeAny
>;

type ActionFormAttachmentsProps<Schema extends z.ZodRawShape> = {
  schema: CombinedSchema<Schema>;
};

const ActionFormAttachments = <Schema extends z.ZodRawShape>({
  schema,
}: ActionFormAttachmentsProps<Schema>) => {
  const form = useFormContext();
  const attachementsFromSchema = Object.entries(schema.shape.attachments.shape);

  return (
    <SectionCard title="Attachments">
      {attachementsFromSchema.map(([key, value]) => (
        <FormField
          key={key}
          control={form.control}
          name={`attachments.${key}.files`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {value.shape.label._def.value}{" "}
                {value.shape.files instanceof z.ZodOptional ? null : (
                  <RequiredIndicator />
                )}
              </FormLabel>
              <Upload files={field.value ?? []} setFiles={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </SectionCard>
  );
};

type ActionFormProps<Schema extends z.ZodRawShape> = {
  schema: CombinedSchema<Schema>;
  defaultValues?: DefaultValues<Schema>;
  title: string;
  //   description: string;
  fieldsLayout?: ({ children }: { children: ReactNode }) => ReactNode;
  fields: (form: UseFormReturn<Schema>) => ReactNode[];
  bannerPostSubmission: Omit<Banner, "pathnameToDisplayOn">;
  promptPreSubmission?: Omit<UserPrompt, "onAccept">;
  promptOnLeavingForm?: Omit<UserPrompt, "onAccept">;
  documentPollerArgs: {
    property: keyof Schema & string;
    documentChecker: CheckDocumentFunction;
  };
  footer?: () => ReactNode;
};

export const ActionForm = <Schema extends z.ZodRawShape>({
  schema,
  defaultValues,
  title,
  // description,
  fields: Fields,
  fieldsLayout: FieldsLayout,
  bannerPostSubmission,
  promptOnLeavingForm,
  promptPreSubmission,
  documentPollerArgs,
  footer: Footer,
}: ActionFormProps<Schema>) => {
  const location = useLocation();
  const navigate = useNavigate();

  const form = useForm<Schema>({
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

  const isAdditionalInformationRequired =
    schema instanceof z.ZodObject && "additionalInformation" in schema.shape;
  const isAttachmentsInSchema =
    schema instanceof z.ZodObject && "attachments" in schema.shape;

  return (
    <SimplePageContainer>
      <BreadCrumbs options={formCrumbsFromPath(location.pathname)} />
      {form.formState.isSubmitting && <LoadingSpinner />}
      <Form {...form}>
        {form.formState.isSubmitting && <LoadingSpinner />}
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

          {isAttachmentsInSchema && <ActionFormAttachments schema={schema} />}
          {isAdditionalInformationRequired && (
            <SectionCard title="Additional Information">
              <FormField
                control={form.control}
                name={"additionalInformation" as FieldPath<Schema>}
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
            >
              Submit
            </Button>
            <Button
              className="px-12"
              onClick={() =>
                userPrompt({ ...promptOnLeavingForm, onAccept: () => {} })
              }
              variant="outline"
              type="reset"
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
