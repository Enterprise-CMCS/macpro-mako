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
import { attachmentSectionMap } from "shared-types";
import type { AttachmentKey } from "shared-types";

type AttachmentType = {
  name: AttachmentKey;
  required: boolean;
};

export const AttachmentsSection = ({
  attachments,
  instructions,
  faqLink,
}: {
  attachments: AttachmentRecipe<AttachmentType>[];
  instructions?: string;
  faqLink: string;
}) => {
  const form = useFormContext();
  return (
    <section className={"mb-8"}>
      <h2 className="font-bold text-2xl font-sans mb-2">Attachments</h2>
      {instructions && <p>{instructions}</p>}
      <AttachmentsSizeTypesDesc faqLink={faqLink} />
      {attachments.map(({ name, required }) => (
        <FormField
          key={String(name) + "-field"}
          control={form.control}
          name={`attachments.${String(name)}`}
          render={({ field }) => (
            <FormItem key={String(name) + "-render"} className="my-4 space-y-2">
              <FormLabel>{attachmentSectionMap[name]}</FormLabel>{" "}
              {required && <RequiredIndicator />}
              <Upload files={field?.value ?? []} setFiles={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </section>
  );
};
