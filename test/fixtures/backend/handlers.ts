import { http, HttpResponse } from "msw";
import { featureFlags } from "shared-utils";
import { getAvailableActions } from "shared-utils";

import { findMockUser, toFullUser } from "../../lib/cognito-tokens";
import { e2eCognitoHandlers } from "./cognito";
import type { BackendStore } from "./store";

const API = "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests";

function corsHeaders(): Record<string, string> {
  return {
    // Credentialed Amplify/XHR calls require an explicit origin (not *).
    "Access-Control-Allow-Origin": "http://localhost:5000",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, PUT, POST, HEAD, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, content-type, x-amz-date, x-amz-security-token, x-api-key, x-amz-user-agent",
    "Access-Control-Expose-Headers": "date, etag, content-type",
    Date: new Date().toUTCString(),
  };
}

function getAuthenticatedUser() {
  const username = process.env.MOCK_USER_USERNAME;
  if (!username) return null;
  const user = findMockUser(username);
  if (!user) return null;
  return toFullUser(user);
}

function extractSearchTerm(must: unknown): string | undefined {
  if (!must) return undefined;
  const rules = Array.isArray(must) ? must : [must];
  for (const rule of rules) {
    const queries = (rule as any)?.dis_max?.queries;
    if (!Array.isArray(queries)) continue;
    for (const query of queries) {
      const wildcard = query?.wildcard;
      if (!wildcard) continue;
      const field = Object.values(wildcard)[0] as { value?: string } | undefined;
      if (field?.value) {
        return field.value.replace(/^\*/, "").replace(/\*$/, "");
      }
    }
  }
  return undefined;
}

function extractAuthorityFilter(must: unknown): string[] | undefined {
  if (!must) return undefined;
  const rules = Array.isArray(must) ? must : [must];
  for (const rule of rules) {
    const terms =
      (rule as any)?.terms?.["authority.keyword"] || (rule as any)?.terms?.authority;
    if (Array.isArray(terms)) return terms.map(String);
  }
  return undefined;
}

function launchDarklyFlags() {
  return Object.values(featureFlags).reduce(
    (flags, { flag, defaultValue }) => {
      // Keep e2e journeys on the non-draft submit path; draft workflows are out of scope.
      const value = flag === featureFlags.SAVE_IN_PROGRESS.flag ? false : defaultValue;
      return {
        ...flags,
        [flag]: {
          version: 50,
          flagVersion: 4,
          variation: 1,
          trackEvents: false,
          value,
        },
      };
    },
    {} as Record<string, unknown>,
  );
}

export function createBackendHandlers(store: BackendStore) {
  const json = (data: unknown, status = 200) =>
    HttpResponse.json(data, { status, headers: corsHeaders() });

  const apiHandlers = [
    http.options(`${API}/*`, () => new HttpResponse(null, { status: 204, headers: corsHeaders() })),

    http.post(`${API}/submit`, async ({ request }) => {
      try {
        const body = (await request.json()) as Record<string, any>;
        store.upsertFromSubmit(body);
        return json({ message: "success" });
      } catch (error) {
        return json(
          { message: error instanceof Error ? error.message : "submit failed" },
          500,
        );
      }
    }),

    http.post(`${API}/search/:index`, async ({ params, request }) => {
      const { index } = params;
      if (index !== "main") {
        return HttpResponse.json({
          hits: { total: { value: 0, relation: "eq" }, hits: [] },
        });
      }

      const body = (await request.json()) as any;
      const must = body?.query?.bool?.must;
      const hits = store.list(extractAuthorityFilter(must), extractSearchTerm(must));

      return json({
        took: 1,
        timed_out: false,
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          total: { value: hits.length, relation: "eq" },
          max_score: 1,
          hits,
        },
        aggregations: {},
      });
    }),

    http.post(`${API}/item`, async ({ request }) => {
      const { id } = (await request.json()) as { id: string };
      const item = store.get(id);
      if (!item) {
        return new HttpResponse(null, { status: 404, headers: corsHeaders() });
      }
      return json(item);
    }),

    http.post(`${API}/itemExists`, async ({ request }) => {
      const { id, includeDrafts } = (await request.json()) as {
        id: string;
        includeDrafts?: boolean;
      };
      const item = store.get(id);
      const exists = Boolean(item?._source);
      return json({
        exists,
        ...(includeDrafts && exists ? { status: item?._source?.seatoolStatus } : {}),
      });
    }),

    http.post(`${API}/getPackageActions`, async ({ request }) => {
      const { id } = (await request.json()) as { id: string };
      if (!id) {
        return json({ message: "Event body required" }, 400);
      }
      const item = store.get(id);
      if (!item?._source?.state) {
        return json({ message: "No record found for the given id" }, 404);
      }
      const authenticatedUser = getAuthenticatedUser();
      if (!authenticatedUser) {
        return json({ message: "User not authenticated" }, 401);
      }
      return json({
        actions: getAvailableActions(authenticatedUser as any, item._source as any) || [],
      });
    }),

    http.post(`${API}/getAttachmentUrl`, async ({ request }) => {
      const { id, bucket, key, filename } = (await request.json()) as {
        id: string;
        bucket: string;
        key: string;
        filename: string;
      };
      return json({
        url: store.attachmentDownloadUrl(id, bucket, key, filename),
      });
    }),

    http.post(`${API}/getAttachmentArchive`, async ({ request }) => {
      const { id, scope, sectionId } = (await request.json()) as {
        id: string;
        scope: "all" | "section";
        sectionId?: string;
      };
      return json(store.nextArchiveStatus(id, scope, sectionId));
    }),

    http.post(`${API}/getUploadUrl`, async ({ request }) => {
      const body = (await request.json().catch(() => ({}))) as { fileName?: string };
      const key = `e2e-uploads/${body.fileName || "upload.bin"}`;
      return json({
        url: `https://test-bucket.s3.us-east-1.amazonaws.com/${key}`,
        key,
        bucket: "test-bucket",
      });
    }),

    // S3 uploads are cross-origin; browsers send an OPTIONS preflight first.
    http.options(/https:\/\/[^/]*s3[^/]*\.amazonaws\.com\/.*/, () =>
      new HttpResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, POST, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      }),
    ),

    http.put(/https:\/\/[^/]*s3[^/]*\.amazonaws\.com\/.*/, () =>
      new HttpResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }),
    ),

    http.get(`${API}/checkIdentifierUsage`, ({ request }) => {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      if (!id) {
        return HttpResponse.json({ message: "Missing required parameter: id" }, { status: 400 });
      }
      const item = store.get(id);
      if (item?._source) {
        return HttpResponse.json({ inUse: true, system: item._source.origin || undefined });
      }
      return HttpResponse.json({ inUse: false });
    }),

    http.post(`${API}/getUserDetails`, async () => {
      const user = getAuthenticatedUser();
      if (!user) return HttpResponse.json(null);
      return HttpResponse.json({
        id: user.username,
        email: (user as any).email,
        firstName: (user as any).given_name,
        lastName: (user as any).family_name,
        role: user.role,
        states: user.states,
      });
    }),

    // Amplify API.post resolves to the role/state-access array itself (not wrapped).
    http.post(`${API}/getUserProfile`, async () => {
      const user = getAuthenticatedUser();
      if (!user) return new HttpResponse("User not authenticated", { status: 401 });
      const email = (user as any).email || "mako.stateuser@gmail.com";
      const states = user.states?.length ? user.states : ["MD"];
      return HttpResponse.json(
        states.map((territory: string) => ({
          id: `${email}-${territory}-${user.role}`,
          eventType: "user-role",
          email,
          doneByEmail: email,
          doneByName: `${(user as any).given_name || ""} ${(user as any).family_name || ""}`.trim(),
          status: "active",
          role: user.role,
          territory,
        })),
      );
    }),

    http.post(`${API}/getApprovers`, async () => HttpResponse.json({ approverList: [] })),

    http.get(/\/systemNotifs/, () => HttpResponse.json([])),

    // Unhandled GETs to the mock API otherwise fall through to real DNS (ERR_NAME_NOT_RESOLVED).
    http.get(`${API}/requestBaseCMSAccess`, () => HttpResponse.json({ status: "ok" })),
    http.get(`${API}/createUserProfile`, () => HttpResponse.json({ status: "ok" })),

    // Match both path-style (s3.region.amazonaws.com/bucket/...) and
    // virtual-hosted (bucket.s3.region.amazonaws.com/...) S3 URLs.
    http.get(/https:\/\/[^/]*s3[^/]*\.amazonaws\.com\/.*/, ({ request }) => {
      const { body, contentType, filename } = store.fileBytesForUrl(request.url);
      return new HttpResponse(body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": String(body.byteLength),
          "Access-Control-Allow-Origin": "*",
        },
      });
    }),
  ];

  const launchDarkly = [
    http.get("https://clientsdk.launchdarkly.us/sdk/goals/*", () => HttpResponse.json([])),
    http.get("https://clientsdk.launchdarkly.us/sdk/evalx/*", () =>
      HttpResponse.json(launchDarklyFlags()),
    ),
    // Keep the SSE stream open. Closing it makes the LD client reconnect in a tight
    // loop and starves timers (documentPoller setInterval never fires).
    http.get("https://clientstream.launchdarkly.us/eval/*", () => {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(launchDarklyFlags())}\n\n`));
          const heartbeat = setInterval(() => {
            try {
              controller.enqueue(encoder.encode(`: heartbeat\n\n`));
            } catch {
              clearInterval(heartbeat);
            }
          }, 15_000);
        },
      });
      return new HttpResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }),
    http.post("https://events.launchdarkly.us/events/bulk/*", () =>
      new HttpResponse(null, { status: 202 }),
    ),
    http.post("https://events.launchdarkly.us/events/diagnostic/*", () =>
      HttpResponse.json({}, { status: 202 }),
    ),
    http.options("https://events.launchdarkly.us/events/diagnostic/*", () =>
      new HttpResponse(null, { status: 204 }),
    ),
  ];

  return [...apiHandlers, ...e2eCognitoHandlers, ...launchDarkly];
}
