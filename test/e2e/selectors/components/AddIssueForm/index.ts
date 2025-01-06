import { Page } from "@playwright/test";

export class AddIssueFormSelectors {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get addButton() {
    return this.page.locator("_react=Button[buttonText=\"Add\"]");
  }

  get submitButton() {
    return this.page.locator("_react=Button[buttonText=\"Submit\"]");
  }

  get titleInput() {
    return this.page.getByLabel("Title");
  }

  get descriptionInput() {
    return this.page.getByLabel("Description");
  }

  get prioritySelect() {
    return this.page.getByRole("combobox", { name: "Priority" });
  }

  get typeSelect() {
    return this.page.getByRole("combobox", { name: "Type" });
  }
}
