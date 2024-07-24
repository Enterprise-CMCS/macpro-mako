import { Action, Authority, AuthorityUnion } from "shared-types";
import { getSchemaFor } from "@/features/package-actions/lib/schemaSwitch";
import { getFieldsFor } from "@/features/package-actions/lib/fieldsSwitch";
import { OneMacUser, submit } from "@/api";
import { buildActionUrl } from "@/utils";
import { FieldValues } from "react-hook-form";
import { getContentFor } from "@/features/package-actions/lib/contentSwitch";
import { documentPoller } from "@/utils/Poller/documentPoller";
import { successCheckSwitch } from "./successCheckSwitch";

export type FormSetup = {
  schema: ReturnType<typeof getSchemaFor>;
  fields: ReturnType<typeof getFieldsFor>;
  content: ReturnType<typeof getContentFor>;
};
/** Builds a form setup using an Action x Authority 2-dimensional
 * lookup. */
export const getSetupFor = (a: Action, p: AuthorityUnion): FormSetup => ({
  schema: getSchemaFor(a, p),
  fields: getFieldsFor(a, p),
  content: getContentFor(a, p),
});
/** Submits the given data to is corresponding Action endpoint, and centralizes
 * success/error handling. */
export const submitActionForm = async ({
  data,
  id,
  actionType,
  user,
  authority,
}: {
  data: FieldValues;
  id: string;
  actionType: Action;
  user: OneMacUser;
  authority: Authority;
}) => {
  await submit({
    data: { ...data, id: id },
    endpoint:
      actionType === Action.TEMP_EXTENSION
        ? "/submit"
        : buildActionUrl(actionType),
    user,
    authority,
  });

  const poller = documentPoller(
    data?.newId ?? id,
    successCheckSwitch(actionType),
  );
  await poller.startPollingData();
};
