import { http, HttpResponse } from "msw";

const defaultLaunchDarklyGoalsHandler = http.get(
  "https://clientsdk.launchdarkly.us/sdk/goals/*",
  async () => new HttpResponse(null, { status: 200 }),
);

const defaultLaunchDarklyHandler = http.get(
  "https://clientsdk.launchdarkly.us/sdk/evalx/*",
  async () => {
    return HttpResponse.json({
      "perform-intake": {
        version: 50,
        flagVersion: 4,
        value: false,
        variation: 1,
        trackEvents: false,
      },
      "login-page": {
        version: 50,
        flagVersion: 5,
        value: true,
        variation: 0,
        trackEvents: false,
      },
      COMPLETE_INTAKE: {
        version: 50,
        flagVersion: 3,
        value: false,
        variation: 1,
        trackEvents: false,
      },
      "site-under-maintenance-banner": {
        version: 50,
        flagVersion: 6,
        value: "OFF",
        variation: 0,
        trackEvents: false,
      },
      toggleFaq: {
        version: 50,
        flagVersion: 11,
        value: false,
        variation: 1,
        trackEvents: false,
      },
      SHOW_SUBMISSION_LOADER: {
        version: 50,
        flagVersion: 2,
        value: false,
        variation: 1,
        trackEvents: false,
      },
      "clear-data-button": {
        version: 50,
        flagVersion: 3,
        value: false,
        variation: 0,
        trackEvents: false,
      },
      "complete-intake": {
        version: 50,
        flagVersion: 2,
        value: false,
        variation: 1,
        trackEvents: false,
      },
      "uat-hide-mmdl-banner": {
        version: 50,
        flagVersion: 19,
        value: "OFF",
        variation: 1,
        trackEvents: false,
      },
      "cms-home-page": {
        version: 50,
        flagVersion: 5,
        value: "OFF",
        variation: 0,
        trackEvents: false,
      },
    });
  },
);

export const launchDarklyHandlers = [defaultLaunchDarklyGoalsHandler, defaultLaunchDarklyHandler];
