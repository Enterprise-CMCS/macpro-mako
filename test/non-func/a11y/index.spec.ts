import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import * as routes from "../../fixtures/routes";

const STATIC_ROUTES = routes.STATIC;

test.describe("test a11y on static routes", {tag: ["@CI", "@a11y"] }, () => {
  for (const route of STATIC_ROUTES) {
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

const WEBFORM_ROUTES = routes.WEBFORM;

// Add to CI when prior to going to Prod
test.describe("test a11y on webform routes", {tag: ["@CI", "@a11y"] }, () => {
  for (const route of WEBFORM_ROUTES) {
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
