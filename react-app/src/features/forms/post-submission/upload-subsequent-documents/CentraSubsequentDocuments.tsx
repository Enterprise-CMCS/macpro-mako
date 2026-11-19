import {
  CE_ATTACHMENT_LABELS,
  CE_EVENT,
  CE_HARDSHIP_EXCEPTION_AUTHORITY,
  CE_HARDSHIP_KIND_CODES,
  CE_OPERATION_TYPE,
  type CeHardshipKindCode,
  isKnownStateCode,
} from "shared-types";

import { ActionForm, ActionFormFieldsArg, FormField, FormItem, FormMessage } from "@/components";
import {
  AttachmentFAQInstructions,
  AttachmentFileFormatInstructions,
} from "@/components/ActionForm/actionForm.components";
import { formSchemas } from "@/formSchemas";
import { formatHardshipKindLabel } from "@/utils";

import { getFAQLinkForAttachments } from "../../faqLinks";
import { NEW_SUBMISSION_PROGRESS_LOSS_REMINDER } from "../../new-submission/content";

export const CENTRA_SUBSEQUENT_PROMPT = {
  header: "Submit additional documents?",
  body: "These documents will be added to the submission and reviewed by CMS.",
  acceptButtonText: "Yes, Submit",
} as const;

export const CENTRA_SUBSEQUENT_BANNER = {
  header: "Documents submitted",
  body: "CMS will review these documents with your submission.",
  variant: "success",
} as const;

const emptyAttachments = {
  ceTemplate: { label: CE_ATTACHMENT_LABELS.ceTemplate, files: [] },
  other: { label: CE_ATTACHMENT_LABELS.other, files: [] },
};

const asHardshipKind = (kind: string | null | undefined): CeHardshipKindCode | undefined => {
  if (kind && (CE_HARDSHIP_KIND_CODES as readonly string[]).includes(kind)) {
    return kind as CeHardshipKindCode;
  }
  return undefined;
};

const CentraSubsequentFields = ({
  control,
}: ActionFormFieldsArg<(typeof formSchemas)["ce-subsequent-documents"]>) => (
  <section className="flex flex-col mb-8 space-y-8">
    <FormField
      control={control}
      name="id"
      render={({ field }) => (
        <FormItem>
          <p className="font-bold">Submission ID</p>
          <p className="text-xl" data-testid="ce-submission-id">
            {field.value}
          </p>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="hardshipKind"
      render={({ field }) => (
        <FormItem>
          <p className="font-bold">Request Type</p>
          <p className="text-xl" data-testid="ce-request-type">
            {formatHardshipKindLabel(field.value)}
          </p>
          <FormMessage />
        </FormItem>
      )}
    />
  </section>
);

type CentraSubsequentDocumentsProps = {
  packageId: string;
  hardshipKind?: string | null;
};

export const CentraSubsequentDocuments = ({
  packageId,
  hardshipKind,
}: CentraSubsequentDocumentsProps) => {
  const prefix = packageId.slice(0, 2);
  const state = isKnownStateCode(prefix) ? prefix : undefined;

  return (
    <ActionForm
      title="Community Engagement Short-Term Hardship Exception Subsequent Documents Details"
      schema={formSchemas["ce-subsequent-documents"]}
      breadcrumbText="New Subsequent Documentation"
      formDescription="Provide revised or additional documentation for your submission. Once you submit this form, you will not be able to edit it. CMS will use this content to review your submission."
      formDescriptionProgressLossReminder={NEW_SUBMISSION_PROGRESS_LOSS_REMINDER}
      fields={CentraSubsequentFields}
      promptPreSubmission={CENTRA_SUBSEQUENT_PROMPT}
      bannerPostSubmission={CENTRA_SUBSEQUENT_BANNER}
      attachments={{
        title: "Subsequent Documents",
        requiredIndicatorForTitle: true,
        instructions: [
          <p key="centra-subsequent-required">
            At least one file is required across Template and Other Supporting Documentation.
          </p>,
          <AttachmentFAQInstructions
            key="centra-subsequent-faq"
            faqLink={getFAQLinkForAttachments("ce-subsequent-documents")}
          />,
          <AttachmentFileFormatInstructions key="centra-subsequent-formats" />,
        ],
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
      defaultValues={{
        id: packageId,
        state,
        authority: CE_HARDSHIP_EXCEPTION_AUTHORITY,
        event: CE_EVENT.SUBSEQUENT_DOCUMENTS,
        operationType: CE_OPERATION_TYPE.SUBSEQUENT_DOCUMENTS,
        hardshipKind: asHardshipKind(hardshipKind),
        additionalInformation: "",
        attachments: emptyAttachments,
      }}
      additionalInformation={{
        required: true,
        title: "Reason for subsequent documents",
        label: "Explain why additional documents are being submitted.",
      }}
    />
  );
};
