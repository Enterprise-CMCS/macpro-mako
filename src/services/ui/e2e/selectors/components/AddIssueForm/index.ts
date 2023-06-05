import { Page } from "@playwright/test";

export const addIssueForm = {
  addButton: (page: Page) => page.locator("_react=Button[buttonText = \"Add\"]"),
  submitButton: (page: Page) =>
    page.locator("_react=Button[buttonText = \"Submit\"]"),
  titleInput: (page: Page) => page.getByLabel("Title"),
  descriptionInput: (page: Page) => page.getByLabel("Description"),
  prioritySelect: (page: Page) =>
    page.getByRole("combobox", { name: "Priority" }),
  typeSelect: (page: Page) => page.getByRole("combobox", { name: "Type" }),
};
