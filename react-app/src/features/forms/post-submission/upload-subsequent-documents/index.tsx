import { useGetItem } from "@/api";
import {
  ActionForm,
  PackageSection,
  SchemaWithEnforcableProps,
} from "@/components";
import {
  AttachmentFAQInstructions,
  AttachmentFileFormatInstructions,
} from "@/components/ActionForm/actionForm.components";
import { formSchemas } from "@/formSchemas";
import { getAuthorityLabel } from "@/utils";
import { Navigate, useParams } from "react-router-dom";
import { AuthorityUnion } from "shared-types";
import { z } from "zod";
import { getFAQLinkForAttachments } from "../../faqLinks";

const pickAttachmentsAndAdditionalInfo = (
  schema: SchemaWithEnforcableProps,
  submissionId: string,
) => {
  if (schema instanceof z.ZodEffects) {
    return pickAttachmentsAndAdditionalInfo(schema.innerType(), submissionId);
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape();

    const optionalAttachmentsShape = Object.fromEntries(
      Object.entries(shape.attachments.shape).map(([key, value]) => [
        key,
        z.object({
          files: value._def.shape().files.optional(),
          label: value._def.shape().label,
        }),
      ]),
    );

    return z
      .object({
        id: z.string().default(submissionId),
        event: z
          .literal("upload-subsequent-documents")
          .default("upload-subsequent-documents"),
        attachments: z.object(optionalAttachmentsShape),
        additionalInformation: z
          .string()
          .min(1, { message: "Additional Information is required." })
          .max(4000)
          .refine((value) => value.trim().length > 0, {
            message: "Additional Information can not be only whitespace.",
          }),
      })
      .refine(
        (data) =>
          data.attachments &&
          Object.values(data.attachments).some(
            (attachment) =>
              attachment && attachment.files && attachment.files.length > 0,
          ),
        {
          message: "At least one attachment must have files.",
          path: ["attachments"],
        },
      );
  }

  throw new Error("No attachments property found in schema");
};

export const UploadSubsequentDocuments = () => {
  const { authority, id } = useParams<{
    id: string;
    authority: AuthorityUnion;
  }>();
  const { data: submission } = useGetItem(id);

  if (submission === undefined) {
    return <Navigate to="/dashboard" />;
  }

  const originalSubmissionEvent = (submission._source.changelog ?? []).reduce<
    string | null
  >((acc, { _source }) => (_source.event ? _source.event : acc), null);

  const schema: SchemaWithEnforcableProps | undefined =
    formSchemas[originalSubmissionEvent];

  if (schema === undefined) {
    return <Navigate to="/dashboard" />;
  }

  const pickedSchema = pickAttachmentsAndAdditionalInfo(schema, submission._id);
  const faqLink = getFAQLinkForAttachments(originalSubmissionEvent);

  return (
    <ActionForm
      title={`Upload Subsequent ${authority} Document Details`}
      schema={pickedSchema}
      breadcrumbText="New Subsequent Documentation"
      formDescription={`
        Provide revised or additional documentation for your submission. 
        Once you submit this form, a confirmation email is sent to you and to CMS. 
        CMS will use this content to review your package, and you will not be able to edit this form. 
        If CMS needs any additional information, they will follow up buy email.
      `}
      fields={PackageSection}
      promptPreSubmission={{
        header: "Submit additional documents?",
        body: "These documents will be added to the package and reviewed by CMS.",
        acceptButtonText: "Yes, Submit",
      }}
      bannerPostSubmission={{
        header: "Documents submitted",
        body: "CMS reviewers will follow up by email if additional information is needed.",
        variant: "success",
      }}
      attachments={{
        title: `Subsequent ${getAuthorityLabel(authority)} Documents`,
        requiredIndicatorForTitle: true,
        instructions: [
          <AttachmentFAQInstructions faqLink={faqLink} />,
          <AttachmentFileFormatInstructions />,
          <p>At least one attachment is required to submit.</p>,
        ],
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
      additionalInformation={{
        required: true,
        title: "Reason for subsequent documents",
        label: "Explain why additional documents are being submitted.",
      }}
    />
  );
};
