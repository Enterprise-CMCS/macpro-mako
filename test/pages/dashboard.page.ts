import { expect, type Locator, type Page } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly homeLink: Locator;
  readonly dashboardLink: Locator;
  readonly faqLink: Locator;
  readonly submissionBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.homeLink = page.getByTestId("Home-d");
    this.dashboardLink = page.getByTestId("Dashboard-d");
    this.faqLink = page.getByTestId("View FAQs-d");
    this.submissionBtn = page.getByTestId("new-sub-button");
  }

  public async validateDownload(
    page,
    {
      role,
      triggerSelector,
      expectedFilename,
    }: {
      role: string;
      triggerSelector: string;
      expectedFilename: string;
    },
  ) {
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId(triggerSelector).click(),
    ]);

    const actualFilename = download.suggestedFilename();
    console.info(`[Download] for ${role} Filename suggested by browser: ${actualFilename}"`);

    expect(actualFilename).toBe(expectedFilename);
  }
}
