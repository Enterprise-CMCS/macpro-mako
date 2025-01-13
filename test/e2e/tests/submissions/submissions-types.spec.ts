import { test } from "@playwright/test";

// TODO
test.describe.skip("Submission Type page", { tag: ["@subtype"] }, () => {
  test.describe.skip("submission type ", () => {
    test.skip("breadcrumbs", async () => {});

    test.skip("page header is displayed", async () => {});

    test.skip("section header is displayed", async () => {});

    test.skip("state plan amendment card", async () => {});

    test.skip("waiver action card", async () => {});

    test.skip("return to Dashboard", async () => {});

    test.describe.skip("spas", () => {
      test.skip("breadcrumb update", async () => {});

      test.skip("page header update", () => {});

      test.skip("section header updated", async () => {});

      test.skip("medicaid spa card", async () => {});

      test.skip("chip spa card", async () => {});

      test.skip("return to submission type page", async () => {
        // breadcrumb navigation backwards
      });

      test.describe.skip("medicaid spa", () => {
        test.skip("breadcrumb update", async () => {});

        test.skip("page header updated", async () => {});

        test.skip("section header updated", async () => {});

        test.skip("medicaid eligibility enrollment card", async() => {});

        test.skip("all other medicaid submissions card", async () => {});

        test.skip("return to spa type", async () => {}); // breadcrumb navigation backwards

        test.describe.skip("medicaid eligibity", () => {
          test.skip("breadcrumb updated", async () => {});

          test.skip("page header updated", async () => {});

          test.skip("page information", async() => {});

          test.skip("macpro system button destination", async () => {});

          test.skip("return to medicaid spa type", async () => {}); // breadcrumb navigation backwards
        });

        test.describe.skip("all other medicaid", () => {
          test.skip("breadcrumb update", async () => {});
          
          test.skip("Medicaid SPA Details form displayed", async () => {});

          test.skip("return to medicaid spa type", async () => {}); // breadcrumb navigation backwards
        });
      });

      test.describe.skip("chip spa", () => {
        test.skip("breadcrumb update", async () => {});

        test.skip("page header updated", async () => {});

        test.skip("section header updated", async () => {});

        test.skip("all other chip submissions card", async() => {});

        test.skip("return to spa type", async () => {}); //breadcrumb navigation backwards

        test.describe.skip("chip spa details page", () => {
          test.skip("breadcrumb update", async () => {});

          test.skip("CHIP SPA Details form displayed", () => {});

          test.skip("return to CHIP SPA Type", async() => {}); // breadcrumb navigation backwards
        });
      });
    });

    test.describe.skip("waiver", () => {
      test.skip("breadcrumbs updated", async () => {});

      test.skip("page header updated", async () => {});

      test.skip("section header updated", async () => {});

      test.skip("Request Temporary Extension card", async () => {});

      test.skip("1915(b) Waiver Actions card", async () => {});

      test.skip("1915(c) Appendix K Amendment card", async () => {});

      test.skip("return to submisstion type", async () => {}); // breadcrumb navigation backwards

      test.describe.skip("Request Temporary Extension", () => {
        test.skip("bradcrumbs updated", async () => {});

        test.skip("Temporary Extension Details page", async () => {});

        test.skip("return to waiver type", async () => {});
      });

      test.describe.skip("1915(b) Waiver Actions", () => {
        test.skip("breadcrumbs updated", async () => {});
      
        test.skip("page header updated", async () => {});
      
        test.skip("section header updated", async () => {});

        test.skip("1915(b)(4) FFS Selective card", async () => {});

        test.skip("1915(b) Comprehensive card", async () => {});

        test.skip("return to waiver type", async () => {});

        test.describe.skip("1915(b)(4) FFS Selective waiver", () => {
          test.skip("breadcrumbs updated", async () => {});
          
          test.skip("page header updated", async () => {});
          
          test.skip("section header updated", async () => {});

          test.skip("FFS Selective New initial waiver card", async () => {});

          test.skip("FFS Selective Renewal Waiver card", async () => {});

          test.skip("FFS Selective Waiver Amendment card", async () => {});

          test.skip("return to 1915(b) waiver type", async () => {});

          test.describe.skip("FFS Selective New initial waiver", () => {
            test.skip("breadcrumbs updated", async () => {});

            test.skip("FFS Selective Initial Waiver details", async () => {});

            test.skip("return to FFS Selective waiver type", () => {});
          });

          test.describe.skip("FFS Selective Renewal Waiver", () => {
            test.skip("breadcrumbs updated", async () => {});

            test.skip("FFS Selective Renewal Waiver details", async () => {});

            test.skip("return to FFS Selective waiver type", () => {});
          });

          test.describe.skip("FFS Selective Waiver Amendment", () => {
            test.skip("breadcrumbs updated", async () => {});

            test.skip("FFS Selective Waiver Amendment details", async () => {});

            test.skip("return to FFS Selective waiver type", () => {});
          });
        });

        test.describe.skip("1915(b) Comprehensive", () => {
          test.skip("breadcrumbs updated", async () => {});
          
          test.skip("page header updated", async () => {});
          
          test.skip("section header updated", async () => {});

          test.skip("Comprehensive New initial waiver card", async () => {});

          test.skip("Comprehensive Renewal Waiver card", async () => {});

          test.skip("Comprehensive Waiver Amendment card", async () => {});

          test.skip("return to 1915(b) waiver type", async () => {});

          test.describe.skip("Comprehensive New initial waiver", () => {
            test.skip("breadcrumbs updated", async () => {});

            test.skip("Comprehensive Initial Waiver details", async () => {});

            test.skip("return to FFS Selective waiver type", () => {});
          });

          test.describe.skip("Comprehensive Renewal Waiver", () => {
            test.skip("breadcrumbs updated", async () => {});

            test.skip("Comprehensive Renewal Waiver details", async () => {});

            test.skip("return to FFS Selective waiver type", () => {});
          });

          test.describe.skip("Comprehensive Waiver Amendment", () => {
            test.skip("breadcrumbs updated", async () => {});

            test.skip("Comprehensive Waiver Amendment details", async () => {});

            test.skip("return to FFS Selective waiver type", () => {});
          });
        });
      });

      test.describe.skip("1915(c) Appendix K Amendment", () => {
        test.skip("breadcrumbs updated", async () => {});

        test.skip("Appendive K Amendment details", async () => {});

        test.skip("return waiver type", () => {});
      });
    });
  });
});