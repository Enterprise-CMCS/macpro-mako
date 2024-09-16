import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, vi, test, expect, beforeAll } from "vitest";
import { MedicaidForm } from "./Medicaid";
import { formSchemas } from "@/formSchemas";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import {
  skipCleanup,
  mockApiRefinements,
} from "@/utils/test-helpers/skipCleanup";
import { renderForm } from "@/utils/test-helpers/renderForm";

vi.mock("@/components/Inputs/upload.utilities", () => ({
  getPresignedUrl: vi.fn(async () => "hello world"),
  uploadToS3: vi.fn(async () => {}),
  extractBucketAndKeyFromUrl: vi.fn(() => ({ bucket: "hello", key: "world" })),
}));
// vi.mock("@/api/itemExists", () => ({
//   itemExists: vi.fn(async () => false),
// }));
// vi.mock("@/utils/user", () => ({
//   isAuthorizedState: vi.fn(async () => true),
// }));

const upload = uploadFiles<(typeof formSchemas)["new-medicaid-submission"]>();

// use container globally for tests to use same render and let each test fill out inputs
// and at the end validate button is enabled for submit
let container: HTMLElement;

describe("Medicaid SPA", () => {
  beforeAll(() => {
    skipCleanup();
    mockApiRefinements();

    const { container: renderedContainer } = renderForm(<MedicaidForm />);

    container = renderedContainer;
  });

  test("SPA ID", async () => {
    const spaIdInput = screen.getByLabelText(/SPA ID/);
    const spaIdLabel = screen.getByTestId("spaid-label");
    // test id validations
    // fails if item exists
    await userEvent.type(spaIdInput, "MD-00-0000");
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
    await userEvent.click(
      screen.getByTestId("proposedEffectiveDate-datepicker"),
    );
    await userEvent.keyboard("{Enter}");
    const proposedEffectiveDateLabel = container.querySelector(
      '[for="proposedEffectiveDate"]',
    );

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
});
