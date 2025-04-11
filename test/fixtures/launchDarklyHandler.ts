import { http, HttpResponse } from "msw";

import { flags } from "./flags";
import { notifs } from "./notifs";

const defaultGetLDGoalsHandler = http.get(
  "https://clientsdk.launchdarkly.us/sdk/goals/*",
  async () => HttpResponse.json([]),
);

const defaultGetLDEvalxHandler = http.get(
  "https://clientsdk.launchdarkly.us/sdk/evalx/*",
  async () => HttpResponse.json(flags),
);

const defaultGetLDEvalStreamHandler = http.get(
  "https://clientstream.launchdarkly.us/eval/*",
  async () => {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        // Encode the string chunks using "TextEncoder".
        controller.enqueue(encoder.encode(JSON.stringify(flags)));
        controller.close();
      },
    });

    // Send the mocked response immediately.
    return new HttpResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  },
);

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
