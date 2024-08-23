import { useFormContext } from "react-hook-form";
import { z } from "zod";
import {
  SectionCard,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RequiredIndicator,
  Upload,
  FormDescription,
} from "@/components";
import { Link } from "react-router-dom";
import { FAQ_TAB } from "../Routing";

const DEFAULT_ATTACHMENTS_INSTRUCTIONS =
  "Maximum file size of 80 MB per attachment. You can add multiple files per attachment type.";

type EnforceSchemaProps<Shape extends z.ZodRawShape> = Shape & {
  attachments?: z.ZodObject<{
    [Key in keyof Shape]: z.ZodObject<{
      label: z.ZodDefault<z.ZodString>;
      files: z.ZodTypeAny;
    }>;
  }>;
  additionalInformation?: z.ZodDefault<z.ZodNullable<z.ZodString>>;
};

export type SchemaWithEnforcableProps<Shape extends z.ZodRawShape> =
  z.ZodObject<EnforceSchemaProps<Shape>, "strip", z.ZodTypeAny>;

type ActionFormAttachmentsProps<Schema extends z.ZodRawShape> = {
  schema: SchemaWithEnforcableProps<Schema>;
  specialInstructions?: string;
  faqLink: string;
};

export const ActionFormAttachments = <Schema extends z.ZodRawShape>({
  schema,
  specialInstructions = DEFAULT_ATTACHMENTS_INSTRUCTIONS,
  faqLink,
}: ActionFormAttachmentsProps<Schema>) => {
  const form = useFormContext();
  const attachementsFromSchema = Object.entries(schema.shape.attachments.shape);

  return (
    <SectionCard title="Attachments">
      <div className="text-gray-700 font-light">
        <p>
          {specialInstructions} Read the description for each of the attachment
          types on the{" "}
          <Link
            to={faqLink}
            target={FAQ_TAB}
            rel="noopener noreferrer"
            className="text-blue-900 underline"
          >
            FAQ Page
          </Link>
          .
        </p>
        <br />
        <p>
          We accept the following file formats:{" "}
          <strong>.doc, .docx, .pdf, .jpg, .xlsx, and more. </strong>{" "}
          <Link
            to={"/faq/acceptable-file-formats"}
            target={FAQ_TAB}
            rel="noopener noreferrer"
            className="text-blue-900 underline"
          >
            See the full list
          </Link>
          .
        </p>
      </div>
      {attachementsFromSchema.map(([key, value]) => {
        const minLength = value.shape.files._def.schema?._def.minLength?.value;
        const maxLength = value.shape.files._def.schema?._def.maxLength?.value;

        return (
          <FormField
            key={key}
            control={form.control}
            name={`attachments.${key}.files`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {value.shape.label._def.defaultValue()}{" "}
                  {value.shape.files instanceof z.ZodOptional ? null : (
                    <RequiredIndicator />
                  )}
                  {!!minLength && maxLength === 1 && (
                    <FormDescription data-testid={`attachment-desc-${key}`}>
                      {"One attachment is required."}
                    </FormDescription>
                  )}
                  {!!minLength && (!maxLength || maxLength > 1) && (
                    <FormDescription data-testid={`attachment-desc-${key}`}>
                      {"At least one attachment is required"}
                    </FormDescription>
                  )}
                </FormLabel>
                <Upload files={field.value ?? []} setFiles={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
    </SectionCard>
  );
};
