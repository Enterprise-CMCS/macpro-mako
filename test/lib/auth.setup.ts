import * as fs from "node:fs/promises";

import { chromium, expect } from "@playwright/test";
import * as path from "path";

import { LoginPage } from "@/pages";

export async function checkAuthPath(storagePath: string) {
  try {
    const projectFolder = path.dirname(path.resolve(storagePath));
    console.log("Checking for auth directory: ", projectFolder);
    await fs.mkdir(projectFolder, { recursive: true });
    return;
  } catch (err) {
    console.warn("Error creating auth directory", err);
  }
}

export async function generateAuthFile({
  baseURL,
  user,
  password,
  storagePath,
  eua = false,
  mfa = false,
}: {
  baseURL: string;
  user: string;
  password: string;
  storagePath: string;
  eua?: boolean;
  mfa?: boolean;
}): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  switch (true) {
    case eua:
      console.log(`eua flag: ${eua}`);
      await loginPage.euaLogin(user, password);
      break;

    case mfa:
      console.log(`mfa flag: ${mfa}`);
      await loginPage.mfaLogin(user, password);
      break;

    default:
      console.log("default");
      await loginPage.login(user, password);
  }

  await expect(page).toHaveURL(/dashboard/);
  await context.storageState({ path: storagePath });
  console.log(`base url: ${baseURL}`);
  console.log(`${storagePath} written`);

  await browser.close();
}
