import { Action, Authority } from "shared-types";
import { getSchemaFor } from "@/features/package-actions/lib/schemaSwitch";
import { getFieldsFor } from "@/features/package-actions/lib/fieldsSwitch";
import { OneMacUser, submit } from "@/api";
import { buildActionUrl, useOriginPath } from "@/utils";
import { Route, useAlertContext, useNavigate } from "@/components";
import { FieldValues } from "react-hook-form";
import { getContentFor } from "@/features/package-actions/lib/contentSwitch";

export type FormSetup = {
  schema: ReturnType<typeof getSchemaFor>;
  fields: ReturnType<typeof getFieldsFor>;
  content: ReturnType<typeof getContentFor>;
};
/** Builds a form setup using an Action x Authority 2-dimensional
 * lookup. */
export const getSetupFor = (a: Action, p: Authority): FormSetup => ({
  schema: getSchemaFor(a, p),
  fields: getFieldsFor(a, p),
  content: getContentFor(a, p),
});
/** Submits the given data to is corresponding Action endpoint, and centralizes
 * success/error handling. */
export const submitActionForm = async ({
  data,
  id,
  type,
  user,
  authority,
  alert,
  navigate,
  originRoute,
}: {
  data: FieldValues;
  id: string;
  type: Action;
  user: OneMacUser;
  authority: Authority;
  originRoute: ReturnType<typeof useOriginPath>;
  alert: ReturnType<typeof useAlertContext>;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const path = originRoute ? originRoute : "/dashboard";
  const actionsThatUseSubmitEndpoint: Action[] = [Action.TEMP_EXTENSION];
  try {
    await submit({
      data: { ...data, id: id },
      endpoint: !actionsThatUseSubmitEndpoint.includes(type)
        ? buildActionUrl(type!) // "/action/{type}"
        : "/submit",
      user,
      authority: authority,
    });
    alert.setBannerStyle("success");
    alert.setBannerShow(true);
    alert.setBannerDisplayOn(path);
    navigate({ path });
  } catch (e: unknown) {
    console.error(e);
    alert.setContent({
      header: "An unexpected error has occurred:",
      body: e instanceof Error ? e.message : String(e),
    });
    alert.setBannerStyle("destructive");
    alert.setBannerDisplayOn(window.location.pathname as Route);
    alert.setBannerShow(true);
    window.scrollTo(0, 0);
  }
};

export * from "../../../components/Form/old-content";
