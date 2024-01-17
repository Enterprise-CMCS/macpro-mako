import { test as setup } from "@playwright/test";
import * as Libs from "../../../../libs/secrets-manager-lib";
import { testUsers } from "./users";

const stage =
  process.env.STAGE_NAME === "production" || process.env.STAGE_NAME === "val"
    ? process.env.STAGE_NAME
    : "default";
const secretId = `${process.env.PROJECT}/${stage}/bootstrapUsersPassword`;

const password = (await Libs.getSecretsValue(
  process.env.REGION_A as string,
  secretId
)) as string;

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page
    .getByRole("textbox", { name: "name@host.com" })
    .fill(testUsers.state);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "submit" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});
