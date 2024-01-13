import { LoadingSpinner } from "@/components";
import { PackageInfo } from "@/pages/actions/common";
import { AttachmentsSizeTypesDesc } from "@/pages/form/content";
import {
  SlotAdditionalInfo,
  SlotAttachments,
} from "@/pages/actions/renderSlots";
import {
  Button,
  FormField,
  FormMessage,
  RequiredIndicator,
} from "@/components/Inputs";
import { ReactElement, ReactNode } from "react";
import { opensearch } from "shared-types";
import { FieldValues, Path } from "react-hook-form";
import { AttachmentRecipe } from "@/lib";
import { useModalContext } from "@/pages/form/modals";
import { ActionFormReturn } from "@/hooks/useActionFormController";

export const ActionFormTemplate = <D extends FieldValues>({
  item,
  form,
  intro,
  attachments,
  attachmentFaqLink,
  attachmentInstructions,
  requireAddlInfo = false,
  addlInfoInstructions,
}: {
  item: opensearch.main.ItemResult;
  form: ActionFormReturn;
  intro: ReactElement;
  attachments: AttachmentRecipe<D>[];
  attachmentFaqLink: string;
  attachmentInstructions?: ReactElement;
  requireAddlInfo?: boolean;
  addlInfoInstructions?: ReactElement;
}) => {
  const { setCancelModalOpen } = useModalContext();
  return (
    <form onSubmit={form.onSubmit}>
      {form.formState.isSubmitting && <LoadingSpinner />}
      {intro}
      <PackageInfo item={item} />
      <h3 className="font-bold text-2xl font-sans">Attachments</h3>
      {attachmentInstructions}
      <AttachmentsSizeTypesDesc faqLink={attachmentFaqLink} />
      {attachments.map(({ name, label, required }) => (
        <FormField
          key={String(name)}
          control={form.control}
          name={`attachments.${String(name)}` as Path<D>}
          render={SlotAttachments({
            label: (
              <>
                {label}
                {required ? <RequiredIndicator /> : ""}
              </>
            ),
            message: <FormMessage />,
            className: "my-4",
          })}
        />
      ))}
      <FormField
        control={form.control}
        name={"additionalInformation" as Path<D>}
        render={SlotAdditionalInfo({
          label:
            "Add anything else you would like to share with the state." as any,
          description: "4,000 characters allowed",
          className: "pt-6",
          required: requireAddlInfo,
        })}
      />
      <div className="flex gap-2 my-8">
        <Button type="submit">Submit</Button>
        <Button onClick={() => setCancelModalOpen(true)} variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
};
