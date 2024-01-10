import { Alert, LoadingSpinner } from "@/components";
import { PackageInfo } from "@/pages/actions/common";
import { AttachmentsSizeTypesDesc } from "@/pages/form/content";
import {
  SlotAdditionalInfo,
  SlotAttachments,
} from "@/pages/actions/renderSlots";
import {
  Form,
  Button,
  FormField,
  FormMessage,
  RequiredIndicator,
} from "@/components/Inputs";
import { ReactElement } from "react";
import { opensearch } from "shared-types";
import {
  FieldValues,
  Path,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import { AttachmentRecipe } from "@/lib";
import { useModalContext } from "@/pages/form/modals";

export const ActionFormTemplate = <D extends FieldValues>({
  item,
  formController,
  submitHandler,
  intro,
  attachments,
  attachmentFaqLink,
  attachmentInstructions,
}: {
  item: opensearch.main.ItemResult;
  formController: UseFormReturn<D>;
  submitHandler: SubmitHandler<D>;
  intro: ReactElement;
  attachments: AttachmentRecipe<D>[];
  attachmentFaqLink: string;
  attachmentInstructions?: ReactElement;
}) => {
  const { setCancelModalOpen } = useModalContext();
  return (
    <Form {...formController}>
      <form onSubmit={formController.handleSubmit(submitHandler)}>
        {formController.formState.isSubmitting && <LoadingSpinner />}
        {intro}
        <PackageInfo item={item} />
        <h3 className="font-bold text-2xl font-sans">Attachments</h3>
        {attachmentInstructions}
        <AttachmentsSizeTypesDesc faqLink={attachmentFaqLink} />
        {attachments.map(({ name, label, required }) => (
          <FormField
            key={String(name)}
            control={formController.control}
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
          control={formController.control}
          name={"additionalInformation" as Path<D>}
          render={SlotAdditionalInfo({
            label: "Add anything else you would like to share with the state.",
            description: "4,000 characters allowed",
            className: "pt-6",
          })}
        />
        <div className="flex gap-2 my-8">
          <Button type="submit">Submit</Button>
          <Button onClick={() => setCancelModalOpen(true)} variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};
