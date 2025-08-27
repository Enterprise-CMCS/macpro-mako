import AxeBuilder from "@axe-core/playwright";
import path from "path";

import { expect, test } from "@/fixtures/mocked";
import * as routes from "@/fixtures/routes";
import { envRoleUsers } from "@/lib/envRoleUsers";

const STATIC_ROUTES = routes.STATIC;
const ENV = process.env.PW_ENV || "local";
const users = envRoleUsers[ENV];

for (const [role, user] of Object.entries(users)) {
  if (!user.capabilities.includes("a11y")) continue;

  test.describe("ally tests", () => {
    test.use({
      storageState: path.resolve(`.auth/${ENV}/${role}.json`),
    });

    test.describe(`${role} on static routes`, {}, () => {
      for (const route of STATIC_ROUTES) {
        test(`${route} should not have any automatically detectable accessibility issues`, async ({
          page,
        }) => {
          await page.goto(route);
          await page.waitForTimeout(2000);

          // wait for loading screen if present
          if (page.getByTestId("three-dots-loading")) {
            await page.getByTestId("three-dots-loading").waitFor({ state: "detached" });
          }

          // make sure we are still on the route and haven't been redirected to /
          await expect(page).toHaveURL(new RegExp(`${route}*`));

          const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
          console.log(`${route} violations: `, accessibilityScanResults.violations.length);
          expect(accessibilityScanResults.violations).toEqual([]);
        });
      }
    });
  });
}
