import { Page } from "@playwright/test";

export const nav = {
  issuesDropDown: (page: Page) =>
    page.locator("_react=NavSection[section.buttonText = \"Issues\"]"),
  allIssuesLink: (page: Page) =>
    page.locator("_react=Link[text = \"All Issues\"]"),
};
