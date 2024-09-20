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

test.describe("test a11y on static routes", () => {
  for (const route of staticRoutes) {
    test(`${route} should not have any automatically detectable accessibility issues`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.waitForTimeout(500);
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      console.log(
        `${route} violations: `,
        accessibilityScanResults.violations.length,
      );
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});

const webformRoutes = [
  "/guides/abp",
  "/webform/g3/202401",
  "/webform/g2b/202401",
  "/webform/g2a/202401",
  "/webform/g1/202401",
  "/webform/cs8/202401",
  "/webform/cs3/202401",
  "/webform/abp11/202401",
  "/webform/abp10/202401",
  "/webform/abp9/202401",
  "/webform/abp7/202401",
  "/webform/abp6/202401",
  "/webform/abp5/202401",
  "/webform/abp4/202401",
  "/webform/abp3_1/202401",
  "/webform/abp3/202401",
  "/webform/abp2c/202401",
  "/webform/abp2b/202401",
  "/webform/abp2a/202401",
  "/webform/abp1/202401",
  "/webform/abp1/202402",
];

test.describe("test a11y on webform routes", () => {
  for (const route of webformRoutes) {
    test(`${route} should not have any automatically detectable accessibility issues`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.waitForTimeout(2000);
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      console.log(
        `${route} violations: `,
        accessibilityScanResults.violations.length,
      );
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
