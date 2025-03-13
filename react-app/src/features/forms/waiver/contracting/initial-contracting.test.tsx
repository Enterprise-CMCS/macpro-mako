import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EXISTING_ITEM_APPROVED_AMEND_ID } from "mocks";
import { beforeAll, describe, expect, test } from "vitest";

import { InitialForm } from "./Initial";

import { formSchemas } from "@/formSchemas";
import { renderFormAsync } from "@/utils/test-helpers/renderForm";
import { mockApiRefinements, skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";

const upload = uploadFiles<(typeof formSchemas)["contracting-initial"]>();

describe("INITIAL CONTRACTING WAIVER", () => {
  beforeAll(async () => {
    skipCleanup();
    mockApiRefinements();

    await renderFormAsync(<InitialForm />);
  });

  test("WAIVER ID", async () => {
    const waiverIdInput = screen.getByLabelText(/initial waiver number/i);
    const waiverIdLabel = screen.getByTestId("waiverid-label");

    await userEvent.type(waiverIdInput, EXISTING_ITEM_APPROVED_AMEND_ID);
    const recordExistsErrorText = screen.getByText(
      /The Initial Waiver Number must be in the format of SS-####.R00.00 or SS-#####.R00.00/,
    );
    expect(recordExistsErrorText).toBeInTheDocument();

    await userEvent.clear(waiverIdInput);

    await userEvent.type(waiverIdInput, "AK-0000.R00.00");
    const invalidStateErrorText = screen.getByText(
      /You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access./,
    );
    expect(invalidStateErrorText).toBeInTheDocument();

    await userEvent.clear(waiverIdInput);

    await userEvent.type(waiverIdInput, "MD-0006.R00.00");

    expect(waiverIdLabel).not.toHaveClass("text-destructive");
  });

  test("PROPOSED EFFECTIVE DATE OF INITIAL CONTRACTING WAIVER", async () => {
    await userEvent.click(screen.getByTestId("proposedEffectiveDate-datepicker"));
    await userEvent.keyboard("{Enter}");
    const proposedEffectiveDateLabel = screen.getByText(
      "Proposed Effective Date of 1915(b) Initial Waiver",
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
