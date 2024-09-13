import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, vi, test, expect, beforeAll } from "vitest";
import { AmendmentForm } from "./Amendment";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { renderForm } from "@/utils/test-helpers/renderForm";
import { formSchemas } from "@/formSchemas";

vi.mock("@/components/Inputs/upload.utilities", () => ({
  getPresignedUrl: vi.fn(async () => "hello world"),
  uploadToS3: vi.fn(async () => {}),
  extractBucketAndKeyFromUrl: vi.fn(() => ({ bucket: "hello", key: "world" })),
}));

const upload = uploadFiles<(typeof formSchemas)["contracting-amendment"]>();

// use container globally for tests to use same render and let each test fill out inputs
// and at the end validate button is enabled for submit
let container: HTMLElement;

describe("AMENDMENT CONTRACTING WAIVER", () => {
  beforeAll(() => {
    skipCleanup();

    const { container: renderedContainer } = renderForm(<AmendmentForm />);

    container = renderedContainer;
  });

  test("WAIVER ID EXISTING", async () => {
    const waiverIdInput = screen.getByLabelText(
      /existing waiver number to amend/i,
    );
    const waiverIdLabel = screen.getByTestId("waiverid-existing-label");
    await userEvent.type(waiverIdInput, "OH-0001.R00.00");

    expect(waiverIdLabel).not.toHaveClass("text-destructive");
  });
  test("WAIVER ID AMENDMENT", async () => {
    const waiverIdInput = screen.getByLabelText(
      /1915\(b\) Waiver Amendment Number/i,
    );
    const waiverIdLabel = screen.getByTestId("waiverid-amendment-label");
    await userEvent.type(waiverIdInput, "OH-0001.R01.00");

    expect(waiverIdLabel).not.toHaveClass("text-destructive");
  });

  test("PROPOSED EFFECTIVE DATE OF AMENDMENT CONTRACTING WAIVER", async () => {
    await userEvent.click(
      screen.getByTestId("proposedEffectiveDate-datepicker"),
    );
    await userEvent.keyboard("{Enter}");
    const proposedEffectiveDateLabel = container.querySelector(
      '[for="proposedEffectiveDate"]',
    );

    expect(proposedEffectiveDateLabel).not.toHaveClass("text-destructive");
  });

  test("B4 WAIVER APPLICATION", async () => {
    const cmsForm179PlanLabel = await upload("b4WaiverApplication");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });
  test("OTHER", async () => {
    const cmsForm179PlanLabel = await upload("other");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });
  test("TRIBAL CONSULTATION", async () => {
    const cmsForm179PlanLabel = await upload("tribalConsultation");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", async () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});
