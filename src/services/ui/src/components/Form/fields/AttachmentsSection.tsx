import { AttachmentRecipe } from "@/utils";
import { useFormContext } from "react-hook-form";
import {
  AttachmentsSizeTypesDesc,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RequiredIndicator,
  Upload,
  SectionCard,
} from "@/components";
import { attachmentTitleMap } from "shared-types";

export const AttachmentsSection = ({
  attachments,
  instructions,
  faqAttLink,
}: {
  attachments: AttachmentRecipe[];
  instructions?: string;
  faqAttLink: string;
}) => {
  const form = useFormContext();
  return (
    <SectionCard title="Attachments" id="attachments">
      {instructions && <p>{instructions}</p>}
      <AttachmentsSizeTypesDesc faqAttLink={faqAttLink} />
      {attachments.map(({ name, required }) => (
        <FormField
          key={String(name) + "-field"}
          control={form.control}
          name={`attachments.${String(name)}`}
          render={({ field }) => (
            <FormItem key={String(name) + "-render"} className="my-4 space-y-2">
              <FormLabel>{attachmentTitleMap[name] ?? name}</FormLabel>{" "}
              {required && <RequiredIndicator />}
              <Upload files={field?.value ?? []} setFiles={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </SectionCard>
  );
};
