import { test, expect, Page } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import * as $ from "@/selectors";

async function goToIssuesPage(page: Page) {
  const navSelectors = new $.NavSelectors(page);
  await page.goto("/");

  // Click the issues link.
  await navSelectors.issuesDropDown.click();
  await navSelectors.allIssuesLink.click();
}

test("create issue should require description", async ({ page }) => {
  const addIssuesFormSelectors = new $.AddIssueFormSelectors(page);
  goToIssuesPage(page);

  await addIssuesFormSelectors.addButton.click();
  await addIssuesFormSelectors.titleInput.fill("Here is a test title");
  await addIssuesFormSelectors.prioritySelect.selectOption("medium");
  await addIssuesFormSelectors.typeSelect.selectOption("other");
  await addIssuesFormSelectors.submitButton.click();

  await expect(page.getByText("Description is required")).toBeVisible();
});

test("should be able to create and delete an issue", async ({ page }) => {
  const addIssuesFormSelectors = new $.AddIssueFormSelectors(page);

  const testDesc = uuidv4();
  goToIssuesPage(page);

  await addIssuesFormSelectors.addButton.click();
  await addIssuesFormSelectors.titleInput.fill("Here is a test title");
  await addIssuesFormSelectors.descriptionInput.fill(testDesc);
  await addIssuesFormSelectors.prioritySelect.selectOption("medium");
  await addIssuesFormSelectors.typeSelect.selectOption("other");
  await addIssuesFormSelectors.submitButton.click();

  await expect(page).toHaveURL(/.*issues/);
  await expect(page.getByRole("cell", { name: testDesc })).toBeVisible();

  // Select the "Delete" button using a single XPath selector
  const buttonSelector = `//td[text()='${testDesc}']/following-sibling::td/button[@aria-label='Delete button']`;

  // Click the "Delete" button
  await page.click(buttonSelector);

  // the row should be deleted
  await expect(page.getByRole("cell", { name: testDesc })).not.toBeVisible();
});
