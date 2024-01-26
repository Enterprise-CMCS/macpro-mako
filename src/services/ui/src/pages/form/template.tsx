import { Alert, LoadingSpinner, SectionCard } from "@/components";
import { ActionFormIntro } from "@/pages/actions/common";
import { AttachmentsSizeTypesDesc } from "@/pages/form/content";
import {
  SlotAdditionalInfo,
  SlotAttachments,
  SlotPackageId,
  SlotProposedEffectiveDate,
} from "@/pages/actions/renderSlots";
import {
  Form,
  Button,
  FormField,
  FormMessage,
  RequiredIndicator,
} from "@/components/Inputs";
import { ReactElement, ReactNode } from "react";
import { opensearch } from "shared-types";
import {
  FieldValues,
  Path,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import { AttachmentRecipe } from "@/lib";
import { useModalContext } from "@/pages/form/modals";
import { Info } from "lucide-react";
import * as Inputs from "@/components/Inputs";

export const SubmissionFormTemplate = <D extends FieldValues>({
  item, // TODO: Will likely need for prefill
  formController,
  submitHandler,
  title,
  description,
  idFieldLabel,
  idFieldDescription,
  idHelpLabel,
  idHelpFAQHash,
  dateFieldLabel,
  attachments,
  attachmentFaqLink,
  attachmentInstructions,
  requireAddlInfo = false,
  addlInfoDescription,
  preSubmitMessage,
}: {
  item?: opensearch.main.ItemResult;
  formController: UseFormReturn<D>;
  submitHandler: SubmitHandler<D>;
  title: string;
  description: ReactNode;
  idFieldLabel: string;
  idFieldDescription: ReactElement;
  idHelpLabel: string;
  idHelpFAQHash: string;
  dateFieldLabel: string;
  attachments: AttachmentRecipe<D>[];
  attachmentFaqLink: string;
  attachmentInstructions?: ReactElement;
  requireAddlInfo?: boolean;
  addlInfoDescription?: ReactElement;
  preSubmitMessage?: string;
}) => {
  const { setCancelModalOpen } = useModalContext();
  return (
    <Form {...formController}>
      <form onSubmit={formController.handleSubmit(submitHandler)}>
        {formController.formState.isSubmitting && <LoadingSpinner />}
        <ActionFormIntro title={title}>
          <RequiredIndicator /> Indicates a required field
          {description}
        </ActionFormIntro>

        <SectionCard title="Package Details">
          {/* TODO: Pre-filled ID field for renewals/amendments */}

          <FormField
            control={formController.control}
            name={"id" as Path<D>}
            render={SlotPackageId({
              label: idFieldLabel,
              description: idFieldDescription,
              faqButtonLabel: idHelpLabel,
              faqHash: idHelpFAQHash,
              className: "pt-6",
            })}
          />
          <FormField
            control={formController.control}
            name={"proposedEffectiveDate" as Path<D>}
            render={SlotProposedEffectiveDate({
              label: dateFieldLabel,
              className: "pt-6",
            })}
          />
        </SectionCard>
        <SectionCard title="Attachments" className={"mt-8"}>
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
        </SectionCard>
        <SectionCard title={"Additional information"} className={"mt-8"}>
          <FormField
            control={formController.control}
            name={"additionalInformation" as Path<D>}
            render={SlotAdditionalInfo({
              label: addlInfoDescription,
              description: "4,000 characters allowed",
            })}
          />
        </SectionCard>
        {Object.keys(formController.formState.errors).length !== 0 && (
          <Alert className="my-4" variant="destructive">
            Input validation error(s)
            <ul className="list-disc">
              {Object.values(formController.formState.errors).map(
                (err, idx) =>
                  err?.message && (
                    <li className="ml-8 my-2" key={idx}>
                      {err.message as string}
                    </li>
                  )
              )}
            </ul>
          </Alert>
        )}
        {preSubmitMessage && (
          <Alert variant={"infoBlock"} className="my-4 w-5/6 flex-row text-sm">
            <Info />
            <p className="ml-2">{preSubmitMessage}</p>
          </Alert>
        )}
        <div className="flex gap-2 my-8">
          <Button type="submit">Submit</Button>
          <Button
            type="button"
            onClick={() => setCancelModalOpen(true)}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};
