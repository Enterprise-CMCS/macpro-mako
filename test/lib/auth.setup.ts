import { chromium, expect } from "@playwright/test";

import { LoginPage } from "@/pages";

export async function generateAuthFile({
  baseURL,
  user,
  password,
  storagePath,
  eua = false,
}: {
  baseURL: string;
  user: string;
  password: string;
  storagePath: string;
  eua?: boolean;
}): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  if (eua) {
    if (!user || !password) {
      throw new Error("user or password is null or not defined");
    }
    await loginPage.euaLogin(user, password);
  } else {
    await loginPage.login(user, password);
  }
  await expect(page).toHaveURL(/dashboard/);
  await context.storageState({ path: storagePath });

  await browser.close();
}
