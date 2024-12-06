import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { z } from "zod";
import { SchemaWithEnforcableProps } from "@/components";

type ExtractAttachmentKeys<TSchema extends SchemaWithEnforcableProps> =
  TSchema extends z.ZodEffects<infer InnerSchema> // Handle ZodEffects
    ? InnerSchema extends z.ZodObject<infer Shape> // Check if inner schema is a ZodObject
      ? Shape["attachments"] extends z.ZodObject<infer AttachmentsShape> // Ensure attachments is a ZodObject
        ? keyof AttachmentsShape // Extract the keys from attachments' shape
        : never
      : never
    : TSchema extends z.ZodObject<infer Shape> // Handle direct ZodObject case
      ? Shape["attachments"] extends z.ZodObject<infer AttachmentsShape> // Ensure attachments is a ZodObject
        ? keyof AttachmentsShape // Extract the keys from attachments' shape
        : never
      : never;

export const uploadFiles = <TSchema extends SchemaWithEnforcableProps>() => {
  type AttachmentKey = ExtractAttachmentKeys<TSchema>;

  return async (attachmentKey: AttachmentKey) => {
    const EXAMPLE_FILE = new File(["¯\\_(ツ)_/¯"], "proposal.png", {
      type: "image/png",
    });

    await userEvent.upload(screen.getByTestId(`${attachmentKey}-upload`), EXAMPLE_FILE);

    return screen.getByTestId(`${attachmentKey}-label`);
  };
};
