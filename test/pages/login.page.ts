import { Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/");

    try {
      await this.page.waitForSelector('[data-testid="sign-in-button-d"]');
      await this.page.locator('[data-testid="sign-in-button-d"]').click();
    } catch (error) {
      console.log("Sign in button not found", error);
    }
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.page.getByRole("textbox", { name: "name@host.com" }).fill(email);
    await this.page.getByRole("textbox", { name: "Password" }).fill(password);
    await this.page.getByRole("button", { name: "submit" }).click();
    await this.page.waitForTimeout(2000);
  }

  async euaLogin(userId, password) {
    await this.goto();
    await this.page.getByRole("button", { name: "Okta" }).click();
    await this.page.waitForURL(/impl.idp.idm.cms.gov/);
    await this.page.locator("#input28").fill(userId);
    await this.page.locator("#input36").fill(password);
    await this.page.locator("#tandc").check();
    await this.page.getByRole("button", { name: "Sign In" }).click();
    await this.page.waitForTimeout(5000);
  }
}
