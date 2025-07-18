import { test } from "@playwright/test";
import path from "path";

import { envRoleUsers } from "@/lib/envRoleUsers";

// add page objects here

const ENV = process.env.PW_ENV || "local";
const users = envRoleUsers[ENV];

for (const [role, user] of Object.entries(users)) {
  if (!user.capabilities.includes("capabilityString")) continue;

  test.describe("page/capability under test", () => {
    test.use({
      storageState: path.resolve(`.auth/${ENV}/${role}.json`),
    });

    test.describe(`${role} test description`, () => {
      // new tests go here
    });
  });
}
