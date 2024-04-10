import { Action, Authority } from "shared-types";
import { ZodObject } from "zod";
import { getSchemaFor } from "@/features/package-actions/lib/schemas";
import { getAttachmentsFor } from "@/features/package-actions/lib/attachments";
import { AttachmentRecipe } from "@/utils";

type FormSetup = {
  schema: ZodObject<any> | undefined;
  attachmentsSetup: AttachmentRecipe<any>[] | undefined;
  content: {};
};
export const getSetupFor = (a: Action, p: Authority): FormSetup => ({
  schema: getSchemaFor(a, p),
  attachmentsSetup: getAttachmentsFor(a, p),
  content: {},
});
