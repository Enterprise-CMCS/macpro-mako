import { test } from "@playwright/test"; // add expect when writing assertions

// TODO
test.describe.skip("Dashboard page", { tag: ["@dashboard",] }, () => {
  test.describe.skip("UI validations", () => {
    test.skip("nav banner updated", async () => {});

    test.skip("page header", async () => {});

    test.skip("SPA and Waiver tabs", async () => {});

    test.skip("search field", async () => {});

    test.skip("columns button", async () => {});

    test.skip("filters buttons", async () => {});

    test.skip("export button", async () => {});

    test.describe.skip("dashboard table", () => {
      test.describe.skip("spas", () => {
        test.skip("column headers", async () => {});

        test.skip("table data", async () => {});

        test.skip("table footer", async () => {});
      });

      test.describe.skip("waivers", () => {
        test.skip("column headers", async () => {});

        test.skip("table data", async () => {});

        test.skip("table footer", async () => {});
      });
    });
  });

  test.describe.skip("navigation validation", () => {
    test.skip("switch to waivers", async () => {});

    test.skip("switch to SPAs", async () => {});

    test.skip("new submission button", async () => {});

    test.skip("package actions", async () => {}); // from table

    test.describe.skip("load spa package details", () => {
      test.describe.skip("medicaid spa", async() => {});

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