import { isStringAuthority } from "shared-types";
import { getDashboardTabForAuthority } from "./crumbs";

/** Constant key for accessing origin in query string. */
export const ORIGIN = "origin";
/** Constant key for `dashboard` origin. */
export const DASHBOARD_ORIGIN = "dashboard";
/** Constant key for `details` origin. */
export const DETAILS_ORIGIN = "details";

type GetFormOriginArgs = {
  id?: string;
  authority?: string;
};

type GetFormOrigin = (args: GetFormOriginArgs) => {
  pathname: string;
  search?: string;
};

/** Get the form's origin pathname
 *
 * NOTE: `getFormOrigin` should _not_ be used within a component's lifecycle as it may result in stale data.
 * Instead, call within functions
 */
export const getFormOrigin: GetFormOrigin = ({ id, authority }) => {
  const origin =
    new URLSearchParams(window.location.search).get(ORIGIN) ?? DASHBOARD_ORIGIN;

  if (origin === DETAILS_ORIGIN && id && authority) {
    return {
      pathname: `/${origin}/${encodeURIComponent(authority)}/${encodeURIComponent(id)}`,
    };
  }

  if (origin === DASHBOARD_ORIGIN && isStringAuthority(authority)) {
    return {
      pathname: `/${origin}`,
      search: new URLSearchParams({
        tab: getDashboardTabForAuthority(authority),
      }).toString(),
    };
  }

  return {
    pathname: `/${origin}`,
  };
};
