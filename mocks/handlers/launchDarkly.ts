import { delay, http, HttpResponse } from "msw";
import { featureFlags } from "shared-utils";

import { notifs } from "../data/notifs";

export type FlagToggles = {
  [key: string]: boolean | string;
};

export type FlagResponse = {
  [key: string]: {
    version: number;
    flagVersion: number;
    variation: number;
    trackEvents: boolean;
    value: boolean | string;
  };
};

const getFlags = (toggleFlags: FlagToggles = {}) =>
  Object.values(featureFlags).reduce(
    (flags, { flag, defaultValue }) => ({
      ...flags,
      [flag]: {
        version: 50,
        flagVersion: 4,
        variation: 1,
        trackEvents: false,
        value: toggleFlags[flag] !== undefined ? toggleFlags[flag] : defaultValue,
      },
    }),
    {} as FlagResponse,
  );

const defaultGetLDGoalsHandler = http.get(
  "https://clientsdk.launchdarkly.us/sdk/goals/*",
  async () => HttpResponse.json([]),
);

export const toggleGetLDEvalxHandler = (toggleFlags?: FlagToggles) =>
  http.get("https://clientsdk.launchdarkly.us/sdk/evalx/*", async () =>
    HttpResponse.json(getFlags(toggleFlags)),
  );

const defaultGetLDEvalxHandler = toggleGetLDEvalxHandler();

export const toggleGetLDEvalStreamHandler = (toggleFlags?: FlagToggles) =>
  http.get("https://clientstream.launchdarkly.us/eval/*", async () => {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Encode the string chunks using "TextEncoder".
        while (true) {
          controller.enqueue(encoder.encode(JSON.stringify(getFlags(toggleFlags))));
          await delay(10000);
        }
      },
    });

    // Send the mocked response immediately.
    return new HttpResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  });

const defaultGetLDEvalStreamHandler = toggleGetLDEvalStreamHandler();

const defaultPostLDEventsBulkHandler = http.post(
  "https://events.launchdarkly.us/events/bulk/*",
  async () => new HttpResponse(null, { status: 202 }),
);

const defaultPostLDEventsDiagnosticHandler = http.post(
  "https://events.launchdarkly.us/events/diagnostic/*",
  async () => HttpResponse.json({}, { status: 202 }),
);

const defaultOptionsLDEventsDiagnosticHandler = http.options(
  "https://events.launchdarkly.us/events/diagnostic/*",
  async () => new HttpResponse(null, { status: 204 }),
);

const defaultGetSystemNotifs = http.get("/playwright-launchdarkly/systemNotifs", async () =>
  HttpResponse.json(notifs),
);

const defaultOptionsSystemNotifs = http.options(
  "/playwright-launchdarkly/systemNotifs",
  async () => new HttpResponse(null, { status: 204 }),
);

export const launchDarklyHandlers = [
  defaultGetLDGoalsHandler,
  defaultGetLDEvalxHandler,
  defaultGetLDEvalStreamHandler,
  defaultPostLDEventsBulkHandler,
  defaultPostLDEventsDiagnosticHandler,
  defaultOptionsLDEventsDiagnosticHandler,
  defaultGetSystemNotifs,
  defaultOptionsSystemNotifs,
];
