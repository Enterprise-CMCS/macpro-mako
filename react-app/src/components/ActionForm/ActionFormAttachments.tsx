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
} from "@/components";
import { Link } from "react-router-dom";
import { FAQ_TAB } from "@/router";

const DEFAULT_ATTACHMENTS_INSTRUCTIONS =
  "Maximum file size of 80 MB per attachment. You can add multiple files per attachment type.";

const AttachmentInstructions = ({ fileValidation }) => {
  const { maxLength, minLength } = fileValidation;

  if (maxLength?.value === 1 && minLength?.value === 1) {
    return <p>One attachment is required</p>;
  }

  if (minLength?.value) {
    return <p>At least one attachment is required</p>;
  }

  return null;
};

type ActionFormAttachmentsProps = {
  attachmentsFromSchema: [string, z.ZodObject<z.ZodRawShape, "strip">][];
  title?: string;
  instructions?: React.ReactNode;
  callout?: string;
  faqLink: string;
};

export const ActionFormAttachments = ({
  attachmentsFromSchema,
  title = "Attachments",
  instructions = DEFAULT_ATTACHMENTS_INSTRUCTIONS,
  callout,
  faqLink,
}: ActionFormAttachmentsProps) => {
  const form = useFormContext();

  return (
    <SectionCard title={title}>
      <div className="text-gray-700 font-light">
        {callout && <p className="font-medium mb-8">{callout}</p>}

        <p data-testid="attachments-instructions">
          {instructions} Read the description for each of the attachment types
          on the{" "}
          <Link
            to={faqLink || "/faq"}
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
      <section className="space-y-8" data-testid="attachments-section">
        {attachmentsFromSchema.map(([key, value]) => (
          <FormField
            key={key}
            control={form.control}
            name={`attachments.${key}.files`}
            render={({ field }) => (
              <FormItem>
                <FormLabel data-testid={`${key}-label`}>
                  {value.shape.label._def.defaultValue()}{" "}
                  {value.shape.files instanceof z.ZodOptional ? null : (
                    <RequiredIndicator />
                  )}
                </FormLabel>
                <AttachmentInstructions
                  fileValidation={value.shape.files._def}
                />
                <Upload
                  files={field.value ?? []}
                  setFiles={field.onChange}
                  dataTestId={key}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </section>
    </SectionCard>
  );
};
