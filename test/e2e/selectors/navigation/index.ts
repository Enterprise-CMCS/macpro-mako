import { Page } from "@playwright/test";

export class NavSelectors {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get issuesDropDown() {
    return this.page.locator(
      "_react=NavSection[section.buttonText = \"Issues\"]"
    );
  }

  get allIssuesLink() {
    return this.page.locator("_react=Link[text = \"All Issues\"]");
  }
}
