import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { ZodObject, ZodRawShape } from "zod";

type WithAttachments<T extends ZodRawShape> = ZodObject<
  T & {
    attachments: ZodObject<ZodRawShape>;
  }
>;

export const uploadFiles = <TSchema extends WithAttachments<ZodRawShape>>() => {
  type AttachmentKey = Extract<
    keyof TSchema["shape"]["attachments"]["shape"],
    string
  >;

  return async (attachmentKey: AttachmentKey) => {
    const EXAMPLE_FILE = new File(["¯\\_(ツ)_/¯"], "proposal.png", {
      type: "image/png",
    });
    await userEvent.upload(
      screen.getByTestId(`${attachmentKey}-upload`),
      EXAMPLE_FILE,
    );

    return screen.getByTestId(`${attachmentKey}-label`);
  };
};
