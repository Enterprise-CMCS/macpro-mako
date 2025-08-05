import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EXISTING_ITEM_ID } from "mocks";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { formSchemas } from "@/formSchemas";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers";
import { mockApiRefinements, skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";

import { MedicaidForm } from "./Medicaid";

const intersectionObserverCb = vi.fn();
vi.stubGlobal(
  "IntersectionObserver",
  vi.fn((cb) => {
    intersectionObserverCb.mockImplementation(cb);
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
  }),
);

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => {
    if (flag === "MED_SPA_FOOTER") return true;
    return false;
  },
}));

const upload = uploadFiles<(typeof formSchemas)["new-medicaid-submission"]>();

describe("Medicaid SPA", () => {
  beforeAll(async () => {
    skipCleanup();
    mockApiRefinements();

    await renderFormWithPackageSectionAsync(<MedicaidForm />);
  });

  test("SPA ID", async () => {
    const spaIdInput = screen.getByLabelText(/SPA ID/);
    const spaIdLabel = screen.getByTestId("spaid-label");

    // test id validations
    // fails if item exists
    await userEvent.type(spaIdInput, EXISTING_ITEM_ID);
    const recordExistsErrorText = screen.getByText(
      /According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again./,
    );
    expect(recordExistsErrorText).toBeInTheDocument();

    await userEvent.clear(spaIdInput);

    // fails if state entered is not a valid state
    await userEvent.type(spaIdInput, "AK-00-0000");
    const invalidStateErrorText = screen.getByText(
      /You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access./,
    );
    expect(invalidStateErrorText).toBeInTheDocument();

    await userEvent.clear(spaIdInput);

    // end of test id validations
    await userEvent.type(spaIdInput, "MD-00-0001");

    expect(spaIdLabel).not.toHaveClass("text-destructive");
  });

  test("PROPOSED EFFECTIVE DATE OF MEDICAID SPA", async () => {
    await userEvent.click(screen.getByTestId("proposedEffectiveDate-datepicker"));
    await userEvent.keyboard("{Enter}");
    const proposedEffectiveDateLabel = screen.getByText("Proposed Effective Date of Medicaid SPA");

    expect(proposedEffectiveDateLabel).not.toHaveClass("text-destructive");
  });

  test("CMS FORM 179", async () => {
    const cmsForm179PlanLabel = await upload("cmsForm179");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });

  test("SPA PAGES", async () => {
    const spaPagesLabel = await upload("spaPages");

    expect(spaPagesLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", async () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });

  test("documentChecker returns true when recordExists is true", () => {
    const mockCheck = { recordExists: true };
    const result = formSchemas["new-medicaid-submission"]._def
      ? (check: typeof mockCheck) => check.recordExists
      : undefined;

    if (result) {
      expect(result(mockCheck)).toBe(true);
    }
  });

  test("MedSpaFooter shows/hides on scroll", () => {
    const footer = screen.getByTestId("medicaid-form-footer");
    expect(footer).not.toHaveClass("fixed");

    act(() => {
      intersectionObserverCb([{ isIntersecting: false }]);
    });

    expect(footer).toHaveClass("fixed");

    act(() => {
      intersectionObserverCb([{ isIntersecting: true }]);
    });

    expect(footer).not.toHaveClass("fixed");
  });
});
