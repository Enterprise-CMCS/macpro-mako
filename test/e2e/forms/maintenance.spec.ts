import { toggleGetLDEvalStreamHandler, toggleGetLDEvalxHandler } from "mocks";

import { expect, test } from "@/fixtures/mocked";

test.describe("Down for maintenance", { tag: ["@home", "@CI"] }, () => {
  test.afterEach(({ worker }) => {
    worker.resetHandlers();
  });

  test("should display no maintenance message if the flag is off", async ({ page }) => {
    await page.goto("/webforms");

    await expect(page.getByRole("heading", { name: "Webforms" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Scheduled Maintenance Flag" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Unscheduled Maintenance Flag" }),
    ).not.toBeVisible();
  });

  test("should display the scheduled maintenance message if the flag is SCHEDULED", async ({
    page,
    worker,
  }) => {
    worker.use(
      toggleGetLDEvalxHandler({ "site-under-maintenance-banner": "SCHEDULED" }),
      toggleGetLDEvalStreamHandler({ "site-under-maintenance-banner": "SCHEDULED" }),
    );
    await page.goto("/webforms");

    await expect(page.getByRole("heading", { name: "Webforms" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Scheduled Maintenance Flag" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Unschedule Maintenance Flag" }),
    ).not.toBeVisible();
  });

  test("should display the unscheduled maintenance message if the flag is UNSCHEDULED", async ({
    page,
    worker,
  }) => {
    worker.use(
      toggleGetLDEvalxHandler({ "site-under-maintenance-banner": "UNSCHEDULED" }),
      toggleGetLDEvalStreamHandler({ "site-under-maintenance-banner": "UNSCHEDULED" }),
    );

    await page.goto("/webforms");

    await expect(page.getByRole("heading", { name: "Webforms" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Unschedule Maintenance Flag" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Scheduled Maintenance Flag" }),
    ).not.toBeVisible();
  });
});
