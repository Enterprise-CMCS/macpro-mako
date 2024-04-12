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
} from "@/components";

export const AttachmentsSection = ({
  attachments,
  instructions,
  faqLink,
}: {
  attachments: AttachmentRecipe<any>[];
  instructions?: string;
  faqLink: string;
}) => {
  const form = useFormContext();
  return (
    <>
      <h2 className="font-bold text-2xl font-sans mb-2">Attachments</h2>
      {instructions && <p>{instructions}</p>}
      <AttachmentsSizeTypesDesc faqLink={faqLink} />
      {attachments.map(({ name, label, required }) => (
        <FormField
          key={String(name) + "-field"}
          control={form.control}
          name={`attachments.${String(name)}`}
          render={({ field }) => (
            <FormItem key={String(name) + "-render"} className="my-4 space-y-2">
              <FormLabel>{label}</FormLabel> {required && <RequiredIndicator />}
              <Upload files={field?.value ?? []} setFiles={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </>
  );
};
