import { Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

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
    await this.page.getByRole("link", { name: "Dashboard" }).isVisible();
  }
}
