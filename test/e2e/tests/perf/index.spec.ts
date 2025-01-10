import { test } from "@playwright/test";
import * as routes from "../fixtures/routes";

const STATIC_ROUTES = routes.STATIC;

test.describe("test performance on static routes", { tag: ["@perf"] }, () => {
  for (const route of STATIC_ROUTES) {
    test(`Time to First Byte for ${route}`, { tag: ["@ttfb"] }, async({ page }) => {
      await page.goto(route);
      const ttfb = await page.evaluate(() => performance.timing.responseStart - performance.timing.requestStart)
      console.log(`TTFB for ${route}: ${ttfb} ms`);
    });

    test(`Largest Contentful Paint for ${route}`, { tag: ["@lcp"] }, async ({ page }) => {
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

    test(`First Contentful Paint for ${route}`, { tag: ["@fcp"] }, async ({ page }) => {
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