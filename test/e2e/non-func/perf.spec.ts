import { test } from "@playwright/test";
import path from "path";

import * as routes from "@/fixtures/routes";
import { envRoleUsers } from "@/lib/envRoleUsers";

const STATIC_ROUTES = routes.STATIC;

const ENV = process.env.PW_ENV || "local";
const users = envRoleUsers[ENV];

for (const [role, user] of Object.entries(users)) {
  if (!user.capabilities.includes("perf")) continue;

  test.describe("perf test", () => {
    test.use({
      storageState: path.resolve(`.auth/${ENV}/${role}.json`),
    });

    test.describe(`${role} test performance on static routes`, () => {
      for (const route of STATIC_ROUTES) {
        test(`${role}-Time to First Byte for ${route}`, { tag: ["@ttfb"] }, async ({ page }) => {
          await page.goto(route);
          const ttfb = await page.evaluate(
            () => performance.timing.responseStart - performance.timing.requestStart,
          );
          console.log(`${role} TTFB for ${route}: ${ttfb} ms`);
        });

        test(
          `${role}-Largest Contentful Paint for ${route}`,
          { tag: ["@lcp"] },
          async ({ page }) => {
            await page.goto(route);
            const lcp = await page.evaluate(async () => {
              return new Promise((resolve) => {
                new PerformanceObserver((entryList) => {
                  const entries = entryList.getEntries();
                  resolve(entries[entries.length - 1]);
                }).observe({ type: "largest-contentful-paint", buffered: true });
              });
            });

            console.log(`${role} Largest Contentful Paint for ${route} is: ${lcp.startTime} ms`);
          },
        );

        test(`${role}-First Contentful Paint for ${route}`, { tag: ["@fcp"] }, async ({ page }) => {
          await page.goto(route);
          const fcp = await page.evaluate(async () => {
            return new Promise((resolve) => {
              new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                resolve(entries[0]);
              }).observe({ type: "paint", buffered: true });
            });
          });

          console.log(`${role} First Contentful Paint for ${route} is: ${fcp.startTime} ms`);
        });
      }
    });
  });
}
