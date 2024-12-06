import { Authority } from "shared-types/authority";
import { getDashboardTabForAuthority } from "./crumbs";

/** Constant key for accessing origin in query string. */
export const ORIGIN = "origin";
/** Constant key for `dashboard` origin. */
export const DASHBOARD_ORIGIN = "dashboard";
/** Constant key for `details` origin. */
export const DETAILS_ORIGIN = "details";
/** Constant key for `spa` origin. */
export const SPA_SUBMISSION_ORIGIN = "spas";
/** Constant key for `waivers` origin. */
export const WAIVER_SUBMISSION_ORIGIN = "waivers";

type GetFormOriginArgs = {
  id?: string;
  authority?: Authority;
};

type GetFormOrigin = (args?: GetFormOriginArgs) => {
  pathname: string;
  search?: string;
};

/** Get the form's origin pathname
 *
 * NOTE: `getFormOrigin` should _not_ be used within a component's lifecycle as it may result in stale data.
 * Instead, call within functions
 */
export const getFormOrigin: GetFormOrigin = ({ id, authority } = {}) => {
  const origin = new URLSearchParams(window.location.search).get(ORIGIN) ?? DASHBOARD_ORIGIN;

  if (origin === DETAILS_ORIGIN && id && authority) {
    return {
      pathname: `/${origin}/${encodeURIComponent(authority)}/${encodeURIComponent(id)}`,
    };
  }

  if (origin === DASHBOARD_ORIGIN && authority) {
    return {
      pathname: `/${origin}`,
      search: new URLSearchParams({
        tab: getDashboardTabForAuthority(authority),
      }).toString(),
    };
  }

  if (origin === SPA_SUBMISSION_ORIGIN || origin === WAIVER_SUBMISSION_ORIGIN) {
    return {
      pathname: `/${DASHBOARD_ORIGIN}`,
      search: new URLSearchParams({
        tab: origin,
      }).toString(),
    };
  }

  return {
    pathname: `/${origin}`,
  };
};
