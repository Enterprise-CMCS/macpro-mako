import { type Locator, type Page } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly desktop: object;
  readonly officialUsage: Locator;
  readonly secureUsage: Locator;

  constructor(page: Page) {
    this.page = page;

    // the desktop object is used to group like selectors
    this.desktop = {
      usaBanner: page.getByTestId("usa-statement-d"),
      usaBannerBtn: page.getByTestId("usa-expand-btn-d"),
      homeLink: page.getByTestId("Home-d"),
      faqLink: page.getByTestId("FAQ-d"),
      signInBtn: page.getByTestId("sign-in-button-d"),
      registerBtn: page.getByTestId("register-button-d"),
      newBetterBtn: page.getByTestId("new-better-btn"),
    };

    this.officialUsage = page.getByTestId("official-usage");
    this.secureUsage = page.getByTestId("secure-usage");
  }
}
