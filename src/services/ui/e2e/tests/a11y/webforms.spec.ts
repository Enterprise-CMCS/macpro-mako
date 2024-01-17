import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// this could be repeated for every page we want to test a11y for.
// we could also have a list of paths to test and loop through them ie ['/', 'dashboard', 'faq'] etc

test.describe("homepage", () => {
  test("should not have any automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle"); // playwright is so fast this is sometimes helpful to slow it down to view results
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
