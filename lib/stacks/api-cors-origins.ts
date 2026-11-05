const LOCAL_UI_ORIGIN = "http://localhost:5173";

/** Strip a trailing slash so CORS origins match browser Origin headers. */
export function applicationOriginFromEndpointUrl(applicationEndpointUrl: string): string {
  return applicationEndpointUrl.replace(/\/$/, "");
}

/** CORS allowlist for the API. Dev stages also allow the local Vite origin. */
export function apiCorsAllowOrigins(applicationEndpointUrl: string, isDev: boolean): string[] {
  const appOrigin = applicationOriginFromEndpointUrl(applicationEndpointUrl);
  if (isDev) {
    return [appOrigin, LOCAL_UI_ORIGIN];
  }
  return [appOrigin];
}
