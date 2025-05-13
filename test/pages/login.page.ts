import { Page } from "@playwright/test";
import * as OTPAuth from "otpauth";

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
    await this.page.waitForURL(/idm.cms.gov/);
    await this.page.locator("#input28").fill(userId);
    await this.page.locator("#input36").fill(password);
    await this.page.locator("#tandc").check();
    await this.page.getByRole("button", { name: "Sign In" }).click();
    await this.page.waitForTimeout(5000);
  }

  async mfaLogin(userId, password) {
    const totp = new OTPAuth.TOTP({
      issuer: "idm.cms.gov",
      label: userId,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: process.env.TOTPSECRET,
    });

    await this.goto();
    await this.page.waitForURL(/idm.cms.gov/);
    await this.page.locator("#input28").fill(userId);
    await this.page.locator("#input36").fill(password);
    await this.page.locator("#tandc").check();
    await this.page.getByRole("button", { name: "Sign In" }).click();
    try {
      await this.page.waitForSelector("div[data-se='google_otp']");
      await this.page.locator("div[data-se='google_otp']").click();
    } catch (error) {
      console.log("MFA choice already known.", error);
    }

    const token = totp.generate();

    await this.page.locator("div[data-se='google_otp']").click();
    await this.page.locator("#input94").fill(token);
    await this.page.getByRole("button", { name: "Verify" }).click();
  }
}
