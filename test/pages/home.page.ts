import { type Locator, type Page } from "@playwright/test";

import { pageText } from "../fixtures/home.page.text";

type StateUsersSection = {
  header: Locator;
  howItWorks: Record<string, Locator>;
  submissionTypes: Record<string, Locator>;
};

type CMSUsersSection = {
  header: Locator;
  howItWorks: Record<string, Locator>;
  submissionTypes: Record<string, Locator>;
};

const stateUserText = pageText.stateUser;
export class HomePage {
  readonly page: Page;
  readonly desktop: Record<string, Locator>;
  readonly officialUsage: Locator;
  readonly secureUsage: Locator;
  readonly largeLogo: Locator;
  readonly welcomeMessage: Locator;
  readonly stateUsersSection: StateUsersSection;
  readonly cmsUsersSection: CMSUsersSection;
  // readonly cmsUsersSection: Record<string, Locator>;

  constructor(page: Page) {
    this.page = page;

    // the desktop object is used to group like selectors
    this.desktop = {
      usaBanner: page.getByTestId("usa-statement-d"),
      usaBannerBtn: page.getByTestId("usa-expand-btn-d"),
      logo: page.getByAltText("onemac site logo"),
      homeLink: page.getByTestId("Home-d"),
      faqLink: page.getByTestId("View FAQs-d"),
      signInBtn: page.getByTestId("sign-in-button-d"),
      registerBtn: page.getByTestId("register-button-d"),
      newBetterBtn: page.getByTestId("new-better-btn"),
    };

    this.stateUsersSection = {
      header: this.getByText(stateUserText.header),
      howItWorks: {
        header: this.getByText(stateUserText.howItWorks.header).first(),
        loginHeader: this.getByText(stateUserText.howItWorks.loginHeader),
        login: this.getByText(stateUserText.howItWorks.login),
        attachHeader: this.getByText(stateUserText.howItWorks.attachHeader),
        attach: this.getByText(stateUserText.howItWorks.attach),
        emailHeader: this.getByText(stateUserText.howItWorks.emailHeader).first(),
        email: this.getByText(stateUserText.howItWorks.email),
      },

      submissionTypes: {
        header: this.getByText(stateUserText.subType.header).first(),
        amendment: this.getByText(stateUserText.subType.amendment),
        responses: this.getByText(stateUserText.subType.responses),
        waiver: this.getByText(stateUserText.subType.waiver),
        appK: this.getByText(stateUserText.subType.appK),
        responses2: this.getByText(stateUserText.subType.responses2),
        te: this.getByText(stateUserText.subType.te).first(),
      },
    };

    this.cmsUsersSection = {};

    this.officialUsage = page.getByTestId("official-usage");
    this.secureUsage = page.getByTestId("secure-usage");

    this.largeLogo = page.getByRole("img", { name: "onemac", exact: true });
    this.welcomeMessage = page.locator("main > div.w-full.bg-primary.p-2 > div > p");
  }

  private getByText(str: string): Locator {
    return this.page.getByText(str);
  }
}
