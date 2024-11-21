import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RequiredIndicator,
  SectionCard,
  Upload,
} from "@/components";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { Fragment } from "react/jsx-runtime";
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
}: ActionFormAttachmentsProps) => {
  const form = useFormContext();

  const attachmentInstructions = instructions ?? [
    <AttachmentFileFormatInstructions />,
    <AttachmentFAQInstructions faqLink={faqLink} />,
  ];

  return (
    <SectionCard
      title={
        <>
          {title} {requiredIndicatorForTitle && <RequiredIndicator />}
        </>
      }
    >
      <div className="text-gray-700 font-light">
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
                <Upload files={field.value ?? []} setFiles={field.onChange} dataTestId={key} />
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </section>
    </SectionCard>
  );
};
