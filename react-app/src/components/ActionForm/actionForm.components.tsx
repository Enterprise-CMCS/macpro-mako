import { FAQ_TAB } from "@/router";
import { Link } from "react-router";
import { z } from "zod";

export const AttachmentFileFormatInstructions = () => (
  <p data-testid="accepted-files">
    We accept the following file formats:{" "}
    <span className="font-bold">.doc, .docx, .pdf, .jpg, .xlsx, and more. </span>{" "}
    <Link
      to={"/faq/acceptable-file-formats"}
      target={FAQ_TAB}
      rel="noopener noreferrer"
      className="text-blue-900 underline"
    >
      See the full list
    </Link>
    .
  </p>
);

export const AttachmentFAQInstructions = ({ faqLink }: { faqLink?: string }) => (
  <p data-testid="attachments-instructions">
    Maximum file size of 80 MB per attachment.{" "}
    <span className="font-bold">You can add multiple files per attachment type.</span> Read the
    description for each of the attachment types on the{" "}
    <Link
      to={faqLink || "/faq"}
      target={FAQ_TAB}
      rel="noopener noreferrer"
      className="text-blue-900 underline"
    >
      FAQ Page
    </Link>
    .
  </p>
);

const isZodArrayDef = (def: unknown): def is z.ZodArrayDef =>
  def && typeof def === "object" && "typeName" in def && def.typeName === "ZodArray";

export const AttachmentInstructions = ({ fileValidation }: { fileValidation: z.ZodArray<any> }) => {
  if (isZodArrayDef(fileValidation)) {
    const { maxLength, minLength } = fileValidation;

    if (maxLength?.value === 1 && minLength?.value === 1) {
      return <p>One attachment is required</p>;
    }

    if (minLength?.value) {
      return <p>At least one attachment is required</p>;
    }
  }

  return null;
};
