import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { Amendment } from "../amend";
import { describe, expect, test, beforeAll } from "vitest";
import { renderFormWithPackageSection } from "@/utils/test-helpers/renderForm";
import { mockApiRefinements } from "@/utils/test-helpers/skipCleanup";
import {
  CAPITATED_INITIAL_ITEM_ID,
  CONTRACTING_INITIAL_ITEM_ID,
  MISSING_CHANGELOG_ITEM_ID,
} from "mocks";

describe("Post-submission Amendment", () => {
  beforeAll(() => {
    mockApiRefinements();
  });
  test("renders Capitated Amendment when changelog contains capitated-initial event", async () => {
    renderFormWithPackageSection(<Amendment />, CAPITATED_INITIAL_ITEM_ID, "Medicaid SPA");
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(
      screen.getByRole("heading", {
        name: "1915(b) Comprehensive (Capitated) Waiver Amendment Details",
      }),
    ).toBeInTheDocument();
  });

  test("renders Contracting Amendment when changelog contains contracting-initial event", async () => {
    renderFormWithPackageSection(<Amendment />, CONTRACTING_INITIAL_ITEM_ID, "Medicaid SPA");
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(
      screen.getByRole("heading", {
        name: "1915(b)(4) FFS Selective Contracting Waiver Amendment Details",
      }),
    ).toBeInTheDocument();
  });

  test("redirects to /dashboard when changelog doesn't contain a relevant event", async () => {
    renderFormWithPackageSection(<Amendment />, MISSING_CHANGELOG_ITEM_ID, "Medicaid SPA");
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(
      screen.getByRole("heading", {
        name: "dashboard test",
      }),
    ).toBeInTheDocument();
  });
});
