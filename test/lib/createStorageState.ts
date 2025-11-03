/**
 * Creates the storagestate needed to auth OneMAC
 */

import { chromium } from "@playwright/test";
import fs from "fs/promises";
import path from "path";

import { authStrategyMap } from "./authStrategies";
import { envRoleUsers } from "./envRoleUsers";

export async function createStorageState(
  env: string,
  baseURL: string,
  role: string,
): Promise<string> {
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  const user = envRoleUsers[env]?.[role];
  const loginFn = authStrategyMap[env]?.[role];

  if (!user) throw new Error(`Missing user for ${role} in ${env}`);
  if (!loginFn) throw new Error(`Missing login function for ${role} in ${env}`);

  await loginFn(page, user.username, user.password);

  const filePath = path.join(".auth", env, `${role}.json`);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(await page.context().storageState()));

  await browser.close();
  return filePath;
}
