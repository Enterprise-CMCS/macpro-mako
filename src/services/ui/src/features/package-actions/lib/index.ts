import { Action, Authority, AuthorityUnion } from "shared-types";
import { getSchemaFor } from "@/features/package-actions/lib/schemaSwitch";
import { getFieldsFor } from "@/features/package-actions/lib/fieldsSwitch";
import { OneMacUser, submit } from "@/api";
import { buildActionUrl, useOriginPath } from "@/utils";
import { Route, useAlertContext, useNavigate } from "@/components";
import { FieldValues } from "react-hook-form";
import { getContentFor } from "@/features/package-actions/lib/contentSwitch";
import { successCheckSwitch } from "./successCheckSwitch";
import { documentPoller } from "@/utils/Poller/seaStatusPoller";
import { stripQueryStringFromURL } from "@/utils/stripQueryString";
import { SPA_ID_REGEX } from "@/consts";

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
  type,
  user,
  authority,
  alert,
  navigate,
  originRoute,
  statusToCheck,
  locationState,
}: {
  data: FieldValues;
  id: string;
  type: Action;
  user: OneMacUser;
  authority: Authority;
  originRoute: ReturnType<typeof useOriginPath>;
  alert: ReturnType<typeof useAlertContext>;
  navigate: ReturnType<typeof useNavigate>;
  statusToCheck: ReturnType<typeof successCheckSwitch>;
  locationState: { from?: string };
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
    // banner display doesn't work with url queries
    alert.setBannerDisplayOn(path.split("?")[0] as Route);

    const poller = documentPoller(id, statusToCheck);
    await poller.startPollingData();

    // path has to be stripped in case it contains a query string in it already
    // this will break things if you try to add any below in the navigate function
    // an example of this is details?id=example-123
    const strippedPath = stripQueryStringFromURL(path);

    navigate({
      path: strippedPath.path as Route,
      query: {
        ...strippedPath.queryParams,
        tab: SPA_ID_REGEX.test(id) ? "spas" : "waivers",
      },
    });
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
