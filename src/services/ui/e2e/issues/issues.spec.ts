import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";

async function goToIssuesPage(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Issues" }).click();
  await page.getByRole("link", { name: "All Issues" }).click();
  await page.getByRole("button", { name: "Add button" }).click();
}

test("create issue should require description", async ({ page }) => {
  goToIssuesPage(page);
  await page.getByLabel("Title").fill("Here is a test title");
  await page.getByRole("combobox", { name: "Priority" }).selectOption("medium");
  await page.getByRole("combobox", { name: "Type" }).selectOption("other");
  await page.getByRole("button", { name: "Submit button" }).click();
  await expect(page.getByText("Description is required")).toBeVisible();
});

test("should be able to create and delete an issue", async ({ page }) => {
  const testDesc = uuidv4();
  goToIssuesPage(page);

  await page.getByLabel("Title").fill("Here is a test title");
  await page.getByLabel("Description").fill(testDesc);
  await page.getByRole("combobox", { name: "Priority" }).selectOption("medium");
  await page.getByRole("combobox", { name: "Type" }).selectOption("other");
  await page.getByRole("button", { name: "Submit button" }).click();

  await expect(page).toHaveURL(/.*issues/);
  await expect(page.getByRole("cell", { name: testDesc })).toBeVisible();

  // this next bit is tricky because we need to find the row containing the text we just entered and then find the delete button in the same row.
  // but we can do it using xpath selectors

  // Select the "Delete" button using a single XPath selector
  const buttonSelector = `//td[text()='${testDesc}']/following-sibling::td/button[@aria-label='Delete button']`;

  // Click the "Delete" button
  await page.click(buttonSelector);

  // the row should be deleted
  await expect(page.getByRole("cell", { name: testDesc })).not.toBeVisible();
});
