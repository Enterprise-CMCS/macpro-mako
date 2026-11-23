import type { Page } from "@playwright/test";
import { featureFlags } from "shared-utils";

/**
 * Abort analytics, stub Google Fonts, and stabilize LaunchDarkly for both tiers.
 * Keeping the LD event stream from flapping avoids remounting ActionForm mid-submit
 * (which skips document polling when isMountedRef flips false).
 */
export async function installThirdPartyStubs(page: Page): Promise<void> {
  await page.route(/googletagmanager\.com|google-analytics\.com|www\.google-analytics\.com/, (route) =>
    route.abort(),
  );

  await page.route(/fonts\.googleapis\.com|fonts\.gstatic\.com/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/css",
      body: "/* e2e stubbed google fonts */",
    });
  });

  const ldFlags = Object.values(featureFlags).reduce(
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

  await page.route(/launchdarkly\.(us|com)/, async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (method === "OPTIONS") {
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    if (url.includes("/sdk/evalx/") || (url.includes("/eval/") && !url.includes("clientstream"))) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(ldFlags),
      });
      return;
    }

    // Event-source: fulfill once with flags; do not leave a flapping stream.
    if (url.includes("clientstream") || url.includes("/eval/")) {
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: `data: ${JSON.stringify(ldFlags)}\n\n`,
      });
      return;
    }

    if (url.includes("/events/") || url.includes("/goals/")) {
      await route.fulfill({ status: 202, body: "" });
      return;
    }

    await route.abort();
  });
}
