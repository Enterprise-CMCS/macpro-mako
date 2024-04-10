import { Action, Authority } from "shared-types";
import { getSchemaFor } from "@/features/package-actions/lib/schemas";
import { getAttachmentsFor } from "@/features/package-actions/lib/attachments";

type FormSetup = {
  schema: ReturnType<typeof getSchemaFor>;
  attachmentsSetup: ReturnType<typeof getAttachmentsFor>;
  // content: {};
};
const getSetupFor = (a: Action, p: Authority): FormSetup => ({
  schema: getSchemaFor(a, p),
  attachmentsSetup: getAttachmentsFor(a, p),
  // content: {},
});

export default getSetupFor;
