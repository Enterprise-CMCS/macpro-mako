import { Fragment } from "react/jsx-runtime";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RequiredIndicator,
  SectionCard,
  Upload,
} from "@/components";

import {
  AttachmentFAQInstructions,
  AttachmentFileFormatInstructions,
  AttachmentInstructions,
} from "./actionForm.components";

export type AttachmentsOptions = {
  title?: string;
  requiredIndicatorForTitle?: boolean;
  instructions?: JSX.Element[];
  callout?: string;
  faqLink?: string;
  type?: string;
};

type ActionFormAttachmentsProps = {
  attachmentsFromSchema: [string, z.ZodObject<z.ZodRawShape, "strip">][];
} & AttachmentsOptions;

export const ActionFormAttachments = ({
  attachmentsFromSchema,
  title = "Attachments",
  faqLink,
  requiredIndicatorForTitle,
  instructions,
  callout,
  type,
}: ActionFormAttachmentsProps) => {
  const form = useFormContext();

  const attachmentInstructions = instructions ?? [
    <AttachmentFAQInstructions faqLink={faqLink} />,
    <AttachmentFileFormatInstructions />,
  ];

  return (
    <SectionCard
      testId="attachment-section"
      title={
        <>
          {title} {requiredIndicatorForTitle && <RequiredIndicator />}
        </>
      }
    >
      <div>
        {callout && (
          <>
            <p className="font-medium">{callout}</p>
            <br />
          </>
        )}
        {attachmentInstructions.map((instruction, i) => (
          <Fragment key={i}>
            {instruction}
            {i < attachmentInstructions.length - 1 && <br />}
          </Fragment>
        ))}
      </div>
      <section className="space-y-8" data-testid="attachments-section">
        {attachmentsFromSchema.map(([key, value]) => (
          <FormField
            key={key}
            control={form.control}
            name={`attachments.${key}.files`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold" data-testid={`${key}-label`}>
                  {value.shape.label._def.defaultValue()}{" "}
                  {value.shape.files instanceof z.ZodOptional ? null : <RequiredIndicator />}
                </FormLabel>
                <AttachmentInstructions fileValidation={value.shape.files._def} />
                <Upload
                  files={field.value ?? []}
                  setFiles={field.onChange}
                  dataTestId={key}
                  type={type}
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
