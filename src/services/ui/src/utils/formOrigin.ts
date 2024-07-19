import { isStringAuthority } from "shared-types";
import { getDashboardTabForAuthority } from "./crumbs";

/** Constant key for accessing origin in query string. */
export const ORIGIN = "origin";
/** Constant key for `dashboard` origin. */
export const DASHBOARD_ORIGIN = "dashboard";
/** Constant key for `details` origin. */
export const DETAILS_ORIGIN = "details";

type GetOriginArgs = {
  id?: string;
  authority?: string;
};

/** Get the origin pathname belonging to the form's action
 *
 * ⚠️: `getOrigin` should not be used with a component's lifecycle as it may result in stale data.
 * Instead, use within functions called by components
 */
export const getOrigin = ({ id, authority }: GetOriginArgs | undefined = {}): {
  pathname: string;
  search?: string;
} => {
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
