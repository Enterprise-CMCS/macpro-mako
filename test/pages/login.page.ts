import { Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/");
    const loginButton = this.page.getByRole("button", { name: "Log in" });
    // const signInButton = this.page.getByRole("button", { name: "Sign In" });

    if (await loginButton.isVisible()) await loginButton.click();
    // if (await signInButton.isVisible()) await signInButton.click();
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.page.getByRole("textbox", { name: "name@host.com" }).fill(email);
    await this.page.getByRole("textbox", { name: "Password" }).fill(password);
    await this.page.getByRole("button", { name: "submit" }).click();
    await this.page.getByRole("link", { name: "Dashboard" }).isVisible();
  }
}
