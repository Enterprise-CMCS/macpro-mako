import { type Locator, type Page } from "@playwright/test";

export class Support {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  /**
   *
   * @param pos a base 0 number, should be no more than 3
   *
   * A method to navigation the form selection
   */
  async navToForm(pos: number) {
    const count = await this.page.getByTestId("card-inner-wrapper").count();

    if (pos > count) {
      await this.page.getByTestId("card-inner-wrapper").last().click();
    } else {
      await this.page.getByTestId("card-inner-wrapper").nth(pos).click();
    }
    await this.page.waitForTimeout(500);
  }

  /**
   *
   * @param selector a string containing the data-testid
   * @param path a string containing the path and filename to upload
   *
   * a universal method to upload a file
   */
  async fileUpload(selector: string, path: string) {
    await this.page.getByTestId(selector).setInputFiles(path);
    await this.page.waitForTimeout(500);
  }
}
