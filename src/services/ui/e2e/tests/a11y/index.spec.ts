import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
  "/new-submission/spa/medicaid/landing/medicaid-abp",
  "/new-submission/spa/medicaid/landing/medicaid-eligibility",
  "/new-submission/spa/chip/landing/chip-eligibility",
];

test.describe("test a11y on static routes", () => {
  for (const route of staticRoutes) {
    test(`${route} should not have any automatically detectable accessibility issues`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.waitForTimeout(4000);
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
  "/webform/abp10/202401",
  "/webform/abp3_1/202401",
  "/webform/abp3/202401",
  "/webform/abp1/202401",
  "/webform/abp1/202402",
];

test.describe("test a11y on webform routes", () => {
  for (const route of webformRoutes) {
    test(`${route} should not have any automatically detectable accessibility issues`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.waitForTimeout(4000);
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      console.log(
        `${route} violations: `,
        accessibilityScanResults.violations.length
      );
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
