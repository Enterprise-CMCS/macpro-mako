import { test } from "@playwright/test";

const staticRoutes = [
  "/",
  "/dashboard",
  "/faq",
  "/profile",
  "/new-submission",
  "/new-submission/spa",
  "/new-submission/spa/medicaid",
  "/new-submission/spa/chip",
  "/new-submission/waiver",
  "/new-submission/waiver/b",
  "/new-submission/waiver/b/b4",
  "/new-submission/waiver/b/capitated",
  "/new-submission/spa/medicaid/landing/medicaid-eligibility",
  "/new-submission/waiver/b/capitated/amendment/create",
  "/new-submission/waiver/b/capitated/renewal/create",
  "/new-submission/waiver/b/capitated/initial/create",
  "/new-submission/waiver/b/b4/initial/create",
  "/new-submission/waiver/b/b4/amendment/create",
  "/new-submission/waiver/b/b4/renewal/create",
  "/new-submission/spa/medicaid/create",
  "/new-submission/spa/chip/create",
  "/new-submission/waiver/app-k",
  "/new-submission/waiver/temporary-extensions",
];

test.describe("test performance on static routes", { tag: ["@perf"] }, () => {
  for (const route of staticRoutes) {
    test(`Time to First Byte for ${route}`, async({ page }) => {
      await page.goto(route);
      // const ttfb = response.timing().responseStart - response.timing().requestStart;
      const ttfb = await page.evaluate(() => performance.timing.responseStart - performance.timing.requestStart)
      console.log(`TTFB for ${route}: ${ttfb} ms`);
    });

    test(`Largest Contentful Paint for ${route}`, async ({ page }) => {
      await page.goto(route);
      const lcp = await page.evaluate(async () => {
        return new Promise((resolve) => {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            resolve(entries[entries.length - 1]);
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        });
      });

      console.log(`Largest Contentful Paint for ${route} is: ${lcp.startTime} ms`);
    });

    test(`First Contentful Paint for ${route}`, async ({ page }) => {
      await page.goto(route);
      const fcp = await page.evaluate(async () => {
        return new Promise((resolve) => {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            resolve(entries[0]);
          }).observe({ type: 'paint', buffered: true });
        });
      });

      console.log(`First Contentful Paint for ${route} is: ${fcp.startTime} ms`);
    });
  }
});