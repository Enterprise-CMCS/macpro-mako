import { test, expect, Page } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import * as $ from "@/selectors";

async function goToIssuesPage(page: Page) {
  await page.goto("/");

  // Click the issues link.
  await $.nav.issuesDropDown(page).click();
  await $.nav.allIssuesLink(page).click();
}

async function clickToAddIssue(page: Page) {
  await $.addIssueForm.addButton(page).click();
}

test("create issue should require description", async ({ page }) => {
  goToIssuesPage(page);
  clickToAddIssue(page);

  await $.addIssueForm.titleInput(page).fill("Here is a test title");
  await $.addIssueForm.prioritySelect(page).selectOption("medium");
  await $.addIssueForm.typeSelect(page).selectOption("other");
  await $.addIssueForm.submitButton(page).click();

  await expect(page.getByText("Description is required")).toBeVisible();
});

test("should be able to create and delete an issue", async ({ page }) => {
  const testDesc = uuidv4();
  goToIssuesPage(page);
  clickToAddIssue(page);

  await $.addIssueForm.titleInput(page).fill("Here is a test title");
  await $.addIssueForm.descriptionInput(page).fill(testDesc);
  await $.addIssueForm.prioritySelect(page).selectOption("medium");
  await $.addIssueForm.typeSelect(page).selectOption("other");
  await $.addIssueForm.submitButton(page).click();

  await expect(page).toHaveURL(/.*issues/);
  await expect(page.getByRole("cell", { name: testDesc })).toBeVisible();

  // Select the "Delete" button using a single XPath selector
  const buttonSelector = `//td[text()='${testDesc}']/following-sibling::td/button[@aria-label='Delete button']`;

  // Click the "Delete" button
  await page.click(buttonSelector);

  // the row should be deleted
  await expect(page.getByRole("cell", { name: testDesc })).not.toBeVisible();
});
