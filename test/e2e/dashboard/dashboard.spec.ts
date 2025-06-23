import { expect, test } from "@/fixtures/mocked"; // add expect when writing assertions

// TODO
test.describe("Dashboard page", { tag: ["@dashboard"] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test.describe("UI validations", { tag: ["@CI", "@smoke"] }, () => {
    test("nav banner updated", async ({ page }) => {
      await expect(page.getByTestId("Home-d")).toBeVisible();
      await expect(page.getByTestId("Home-d")).toHaveText("Home");
      await expect(page.getByTestId("Home-d")).not.toHaveClass("underline");

      await expect(page.getByTestId("Dashboard-d")).toBeVisible();
      await expect(page.getByTestId("Dashboard-d")).toHaveText("Dashboard");
      await expect(page.getByTestId("Dashboard-d")).toHaveClass(/underline/);

      await expect(page.getByTestId("View FAQs-d")).toBeVisible();
      await expect(page.getByTestId("View FAQs-d")).toHaveText("View FAQs");
      await expect(page.getByTestId("View FAQs-d")).not.toHaveClass("underline");
    });

    test("page header", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Dashboard" })).toHaveText("Dashboard");

      await expect(page.getByTestId("new-sub-button")).toBeVisible();
      await expect(page.getByTestId("new-sub-button")).toHaveText("New Submission");
    });

    test("SPA and Waiver tabs", async ({ page }) => {
      await expect(page.getByRole("tab", { name: "SPAs" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "SPAs" })).toHaveText("SPAs");

      await expect(page.getByRole("tab", { name: "Waivers" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Waivers" })).toHaveText("Waivers");
    });

    test("search field", async ({ page }) => {
      await expect(page.getByTestId("filtering").locator("p")).toBeVisible();
      await expect(page.getByTestId("filtering").locator("p")).toHaveText(
        "Search by Package ID, CPOC Name, or Submitter Name",
      );

      await expect(page.locator("#search-input")).toBeVisible();
    });

    test("columns button", async ({ page }) => {
      await expect(page.getByRole("button", { name: /Columns/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Columns/ })).toHaveText("Columns (3 hidden)");
    });

    test("filters buttons", async ({ page }) => {
      await expect(page.getByRole("button", { name: /Filters/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Filters/ })).toHaveText("Open filter panel");
    });

    test("export button", async ({ page }) => {
      await expect(page.getByRole("button", { name: /Export/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Export/ })).toHaveText("Export");
    });

    test.describe("dashboard table", () => {
      test.describe("spas", () => {
        test("column headers", async ({ page }) => {
          const header = await page.locator("th");
          const count = await header.count();

          const headerValues = [
            "Actions",
            "SPA ID",
            "State",
            "Authority",
            "Status",
            "Initial Submission",
            "Latest Package Activity",
            "Formal RAI Response",
            "Submitted By",
          ];

          for (let i = 0; i < count; i++) {
            await expect(await header.nth(i)).toBeVisible();
            await expect(await header.nth(i).textContent()).toEqual(headerValues[i]);
          }
        });

        test("table data", async ({ page }) => {
          await expect(page.locator("tbody")).toBeVisible();
        });

        test("table footer", async ({ page }) => {
          await expect(page.getByTestId("pagination")).toBeVisible();
        });
      });

      test.describe("waivers", () => {
        test.beforeEach(async ({ page }) => {
          await page.getByRole("tab", { name: "Waivers" }).click();
        });

        test("column headers", async ({ page }) => {
          const header = await page.locator("th");
          const count = await header.count();

          const headerValues = [
            "Actions",
            "SPA ID",
            "State",
            "Authority",
            "Status",
            "Initial Submission",
            "Latest Package Activity",
            "Submitted By",
            "Formal RAI Response",
          ];

          for (let i = 0; i < count; i++) {
            await expect(await header.nth(i)).toBeVisible();
            await expect(await header.nth(i).textContent()).toEqual(headerValues[i]);
          }
        });

        test("table data", async ({ page }) => {
          await expect(page.locator("tbody")).toBeVisible();
        });

        test("table footer", async ({ page }) => {
          await expect(page.getByTestId("pagination")).toBeVisible();
        });
      });
    });
  });

  test.describe.skip("navigation validation", () => {
    test.skip("switch to waivers", async () => {});

    test.skip("switch to SPAs", async () => {});

    test.skip("new submission button", async () => {});

    test.skip("package actions", async () => {}); // from table

    test.describe.skip("load spa package details", () => {
      test.describe.skip("medicaid spa", async () => {});

      test.describe.skip("chip spa", async () => {});
    });

    test.describe.skip("load waiver package details", () => {
      test.describe.skip("1915(b)", () => {});

      test.describe.skip("1915(c)", () => {});
    });
  });

  test.describe.skip("workflow validation", () => {
    test.describe.skip("table actions", () => {
      test.describe.skip("spas", () => {
        test.describe.skip("sort", () => {});

        test.describe.skip("change record count", () => {});

        test.describe.skip("page navigation", () => {});

        test.describe.skip("show/hide columns", () => {}); // add export validation here

        test.describe.skip("filters", () => {});
      });

      test.describe.skip("waivers", () => {
        test.describe.skip("sort", () => {});

        test.describe.skip("change record count", () => {});

        test.describe.skip("page navigation", () => {});

        test.describe.skip("show/hide columns", () => {}); // add export validation here

        test.describe.skip("filters", () => {});
      });
    });
  });
});
