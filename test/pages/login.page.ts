// import { type Page } from "@playwright/test";

// export class LoginPage {
//   readonly page: Page;
//   constructor(page: Page) {
//     this.page = page;
//   }

//   async goto() {
//     await this.page.goto("/");
//     await this.page.getByRole("button", { name: "Sign In" }).click();
//   }

//   async login(email: string, password: string) {
//     await this.goto();
//     await this.page.getByRole("textbox", { name: "name@host.com" }).fill(email);
//     await this.page.getByRole("textbox", { name: "Password" }).fill(password);
//     await this.page.getByRole("button", { name: "submit" }).click();
//     // await this.page.getByRole("link", { name: "Dashboard" }).waitFor();
//     await this.page.getByRole("link", { name: "Dashboard" }).isVisible();
//   }
// }
