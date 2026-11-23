import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineNetworkFixture, type NetworkFixture } from "@msw/playwright";
import { expect, type Page, test as base } from "@playwright/test";
import type { AnyHandler } from "msw";
import { featureFlags } from "shared-utils";

import { setMockUserEnv } from "../lib/auth";
import { type BackendFixture, createBackend, type SeedPackageOptions } from "./backend";
import { installThirdPartyStubs } from "./third-party";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEPLOYED_PACKAGE_PATH = path.join(__dirname, "../.state/deployed-package.json");
const MOCKED_ORIGIN = "http://localhost:5000";

function stableLaunchDarklyFlags(): Record<string, unknown> {
  return Object.values(featureFlags).reduce(
    (flags, { flag, defaultValue }) => {
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

type Fixtures = {
  e2eInit: void;
  thirdParty: void;
  handlers: AnyHandler[];
  network: NetworkFixture | null;
  backend: BackendFixture;
  pkg: { id: string; authority: string };
};

const isDeployedProject = (projectName: string) => projectName.startsWith("deployed");

export const test = base.extend<Fixtures>({
  e2eInit: [
    async ({ context }, use) => {
      await context.addInitScript(() => {
        (globalThis as typeof globalThis & { __MAKO_E2E__?: boolean }).__MAKO_E2E__ = true;
      });
      setMockUserEnv("state-submitter");
      await use();
    },
    { auto: true },
  ],

  thirdParty: [
    async ({ page }, use) => {
      await installThirdPartyStubs(page);
      await use();
    },
    { auto: true },
  ],

  // Playwright fixtures with no dependencies use an empty destructure.
  // eslint-disable-next-line no-empty-pattern -- intentional Playwright fixture shape
  backend: async ({}, use) => {
    const backend = createBackend();
    await use(backend);
  },

  handlers: async ({ backend }, use, testInfo) => {
    if (isDeployedProject(testInfo.project.name)) {
      await use([]);
      return;
    }
    await use(backend.handlers);
  },

  network: [
    async ({ context, handlers, backend }, use, testInfo) => {
      if (isDeployedProject(testInfo.project.name) || handlers.length === 0) {
        await use(null);
        return;
      }

      const network = defineNetworkFixture({
        context,
        handlers,
        onUnhandledRequest: "bypass",
      });
      await network.enable();

      // Take precedence over MSW for LaunchDarkly so the event-stream does not flap.
      await context.route(/launchdarkly\.(us|com)/, async (route) => {
        const url = route.request().url();
        const method = route.request().method();
        if (method === "OPTIONS") {
          await route.fulfill({ status: 204, body: "" });
          return;
        }
        if (url.includes("/sdk/evalx/")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(stableLaunchDarklyFlags()),
          });
          return;
        }
        if (url.includes("clientstream") || url.includes("/eval/")) {
          await route.fulfill({
            status: 200,
            headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
            body: `data: ${JSON.stringify(stableLaunchDarklyFlags())}\n\n`,
          });
          return;
        }
        await route.fulfill({ status: 202, body: "" });
      });

      // Amplify API calls are credentialed; browsers reject ACAO=* with credentials.
      const cors = {
        "Access-Control-Allow-Origin": MOCKED_ORIGIN,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, PUT, POST, HEAD, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, content-type, x-amz-date, x-amz-security-token, x-api-key, x-amz-user-agent",
        "Access-Control-Expose-Headers": "date, etag, content-type",
      };

      // Amplify axios + @msw/playwright has been unreliable for /submit and /item
      // (request reaches MSW, UI promise never settles, documentPoller never starts).
      // Fulfill those through Playwright routes against the same in-memory store.
      await context.route(/\/mocked-tests\/submit\/?$/, async (route) => {
        try {
          if (route.request().method() === "OPTIONS") {
            await route.fulfill({ status: 204, headers: cors });
            return;
          }
          if (route.request().method() !== "POST") {
            await route.fallback();
            return;
          }
          const raw = route.request().postData() || "{}";
          const body = JSON.parse(raw) as Record<string, unknown>;
          backend.upsertFromSubmit(body);
          await route.fulfill({
            status: 200,
            headers: { ...cors, "Content-Type": "application/json" },
            body: JSON.stringify({ message: "success" }),
          });
        } catch (error) {
          console.error("[e2e-route] /submit error", error);
          await route.fulfill({
            status: 500,
            headers: { ...cors, "Content-Type": "application/json" },
            body: JSON.stringify({
              message: error instanceof Error ? error.message : "submit route failed",
            }),
          });
        }
      });

      await context.route(/\/mocked-tests\/item\/?$/, async (route) => {
        try {
          if (route.request().method() === "OPTIONS") {
            await route.fulfill({ status: 204, headers: cors });
            return;
          }
          if (route.request().method() !== "POST") {
            await route.fallback();
            return;
          }
          const raw = route.request().postData() || "{}";
          const { id } = JSON.parse(raw) as { id?: string };
          const item = id ? backend.get(id) : undefined;
          if (!item) {
            await route.fulfill({
              status: 404,
              headers: { ...cors, "Content-Type": "application/json" },
              body: JSON.stringify({ message: "No record found for the given id" }),
            });
            return;
          }
          await route.fulfill({
            status: 200,
            headers: { ...cors, "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
        } catch (error) {
          console.error("[e2e-route] /item error", error);
          await route.fulfill({
            status: 500,
            headers: { ...cors, "Content-Type": "application/json" },
            body: JSON.stringify({
              message: error instanceof Error ? error.message : "item route failed",
            }),
          });
        }
      });

      // Belt-and-suspenders for S3: Playwright route handles CORS preflight + PUT
      // reliably for Amplify uploads (MSW alone has been flaky for cross-origin PUT).
      await context.route(/https:\/\/[^/]*s3[^/]*\.amazonaws\.com\/.*/, async (route) => {
        const method = route.request().method();
        if (method === "OPTIONS") {
          await route.fulfill({
            status: 204,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, PUT, POST, HEAD, OPTIONS",
              "Access-Control-Allow-Headers": "*",
            },
          });
          return;
        }
        if (method === "PUT" || method === "POST") {
          await route.fulfill({
            status: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: "",
          });
          return;
        }
        // GET downloads / archives
        const url = route.request().url();
        const filename = decodeURIComponent(url.split("/").pop() || "file.bin");
        const isZip = filename.endsWith(".zip") || url.includes("archive-bucket");
        const body = isZip
          ? Buffer.from("PK\u0005\u0006" + "\u0000".repeat(18))
          : Buffer.from("%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<< /Root 1 0 R >>\n%%EOF\n", "utf8");
        await route.fulfill({
          status: 200,
          headers: {
            "Content-Type": isZip ? "application/zip" : "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Access-Control-Allow-Origin": "*",
          },
          body,
        });
      });

      await use(network);
      await context.unroute(/\/mocked-tests\/submit\/?$/);
      await context.unroute(/\/mocked-tests\/item\/?$/);
      await context.unroute(/https:\/\/[^/]*s3[^/]*\.amazonaws\.com\/.*/);
      await network.disable();
    },
    { auto: true },
  ],

  pkg: async ({ backend }, use, testInfo) => {
    if (isDeployedProject(testInfo.project.name)) {
      try {
        const raw = await fs.readFile(DEPLOYED_PACKAGE_PATH, "utf8");
        const parsed = JSON.parse(raw) as { id: string; authority?: string };
        await use({ id: parsed.id, authority: parsed.authority || "Medicaid SPA" });
      } catch {
        await use({ id: "", authority: "Medicaid SPA" });
      }
      return;
    }

    // Pending (not Submitted): Submitted is a placeholder status that hides Withdraw Package.
    const seeded = backend.seedPackage({
      status: "Pending",
      authority: "Medicaid SPA",
      attachments: [
        { title: "CMS-179 Form", filename: "cms-179.pdf" },
        { title: "SPA Pages", filename: "spa-pages.pdf" },
      ],
    });

    await use({
      id: seeded._id!,
      authority: seeded._source!.authority!,
    });
  },
});

export { expect };

export async function writeDeployedPackageState(pkg: {
  id: string;
  authority?: string;
}): Promise<void> {
  await fs.mkdir(path.dirname(DEPLOYED_PACKAGE_PATH), { recursive: true });
  await fs.writeFile(DEPLOYED_PACKAGE_PATH, JSON.stringify(pkg, null, 2));
}

export const fixtureFiles = {
  cms179: path.join(__dirname, "files/cms-179.pdf"),
  spaPages: path.join(__dirname, "files/spa-pages.pdf"),
};

/** Wait for a download, popup, or the in-app archive fallback link after window.open. */
export async function expectDownloadOrPopup(
  page: Page,
  action: () => Promise<void>,
): Promise<{ kind: "download" | "popup" | "fallback"; filename?: string; url?: string }> {
  const timeout = 20_000;
  // Race the three success signals so a fast download does not wait out the others' timeouts.
  const resultPromise = Promise.race([
    page
      .context()
      .waitForEvent("download", { timeout })
      .then((download) => ({
        kind: "download" as const,
        filename: download.suggestedFilename(),
      })),
    page.waitForEvent("popup", { timeout }).then((popup) => ({
      kind: "popup" as const,
      url: popup.url(),
    })),
    page
      .getByRole("link", { name: /Download the attachment archive/i })
      .waitFor({ state: "visible", timeout })
      .then(async (locator) => ({
        kind: "fallback" as const,
        url: (await locator.getAttribute("href")) || undefined,
      })),
  ]);

  await action();
  return resultPromise;
}

export type { SeedPackageOptions };
