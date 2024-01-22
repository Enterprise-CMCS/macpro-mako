import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const staticRoutes = ["/", "/dashboard", "/faq", "/profile"];

test.describe("test a11y on static routes", () => {
  for (const route of staticRoutes) {
    test(`${route} should not have any automatically detectable accessibility issues`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle"); // playwright is so fast this is sometimes helpful to slow it down to view results
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      console.log(
        `${route} violations: `,
        accessibilityScanResults.violations.length
      );
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});

const webformRoutes = [
  "/guides/abp",
  "/webform/abp10/1",
  "/webform/abp3_1/1",
  "/webform/abp3/1",
  "/webform/abp1/1",
];

test.describe("test a11y on webform routes", () => {
  for (const route of webformRoutes) {
    test(`${route} should not have any automatically detectable accessibility issues`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      console.log(
        `${route} violations: `,
        accessibilityScanResults.violations.length
      );
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
