import { type Locator, type Page } from "@playwright/test";

import { pageText } from "../fixtures/home.page.text";

type Section = {
  header: Locator;
  howItWorks: Record<string, Locator>;
  submissionTypes: Record<string, Locator>;
};

const stateUserText = pageText.stateUser;
const cmsUserText = pageText.cmsUser;
export class HomePage {
  readonly page: Page;
  readonly desktop: Record<string, Locator>;
  readonly officialUsage: Locator;
  readonly secureUsage: Locator;
  readonly largeLogo: Locator;
  readonly welcomeMessage: Locator;
  readonly stateUsersSection: Section;
  readonly cmsUsersSection: Section;
  readonly footer: Record<string, Locator>;

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

    this.cmsUsersSection = {
      header: this.getByText(cmsUserText.header),
      howItWorks: {
        header: this.getByText(cmsUserText.howItWorks.header).last(),
        emailHeader: this.getByText(cmsUserText.howItWorks.emailHeader),
        email: this.getByText(cmsUserText.howItWorks.email),
        euaHeader: this.getByText(cmsUserText.howItWorks.euaHeader),
        eua: this.getByText(cmsUserText.howItWorks.eua),
        assignedHeader: this.getByText(cmsUserText.howItWorks.assignedHeader),
        assigned: this.getByText(cmsUserText.howItWorks.assigned),
      },

      submissionTypes: {
        header: this.getByText(cmsUserText.subType.header).last(),
        amendments: this.getByText(cmsUserText.subType.amendments),
        responses: this.getByText(cmsUserText.subType.responses),
        waiver: this.getByText(cmsUserText.subType.waiver),
        appK: this.getByText(cmsUserText.subType.appK),
        responses2: this.getByText(cmsUserText.subType.responses2),
        te: this.getByText(cmsUserText.subType.te).last(),
      },
    };

    this.footer = {
      medicaidLogo: this.page.getByAltText("Logo for Medicaid"),
      dohLogo: this.page.locator("img[src='/DepartmentOfHealthLogo.svg']"),
      fedDisclaimer: this.getByText(pageText.footer.disclaimer),
      contactEmail: this.page.locator("a[href^='mailto:']"),
      // contactAddress: "",
    };

    this.officialUsage = page.getByTestId("official-usage");
    this.secureUsage = page.getByTestId("secure-usage");

    this.largeLogo = page.getByRole("img", { name: "onemac", exact: true });
    this.welcomeMessage = page.locator("main > div.w-full.bg-primary.p-2 > div > p");
  }

  private getByText(str: string): Locator {
    return this.page.getByText(str);
  }
}
