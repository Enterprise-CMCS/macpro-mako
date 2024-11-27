import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, beforeAll } from "vitest";
import { skipCleanup, mockApiRefinements } from "@/utils/test-helpers/skipCleanup";
import { renderForm } from "@/utils/test-helpers/renderForm";
import { formSchemas } from "@/formSchemas";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { AppKAmendmentForm } from ".";
const upload = uploadFiles<(typeof formSchemas)["app-k"]>();

describe("Appendix K", () => {
  beforeAll(async () => {
    skipCleanup();
    mockApiRefinements();

    renderForm(<AppKAmendmentForm />);
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));
  });

  test("Amendment title", async () => {
    const amendmentTitle = screen.getByLabelText(/Amendment Title/);
    await userEvent.type(amendmentTitle, "Example Title");
    expect(amendmentTitle).toBeInTheDocument();
  });

  test("Waiver number should error if input is invalid", async () => {
    const waiverNumberInput = screen.getByLabelText(/Waiver Amendment Number/);
    expect(waiverNumberInput).toBeInTheDocument();
    await userEvent.type(waiverNumberInput, "12");

    const waiverIdLabel = screen.getByTestId("amendmentnumber-label");
    expect(waiverIdLabel).toHaveClass("text-destructive");

    await userEvent.clear(waiverNumberInput);

    await userEvent.type(waiverNumberInput, "MD-1234.R12.09");
    expect(waiverIdLabel).not.toHaveClass("text-destructive");
  });

  test("Proposed effective date of appK waiver", async () => {
    const proposedEffectiveDateLabel = screen.getByTestId("proposedEffectiveDate-datepicker");
    await userEvent.click(proposedEffectiveDateLabel);
    await userEvent.keyboard("{Enter}");

    expect(proposedEffectiveDateLabel).not.toHaveClass("text-destructive");
  });

  test("Upload required attachments", async () => {
    const appKTemplateLabel = await upload("appk");
    expect(appKTemplateLabel).not.toHaveClass("text-destructive");

    const otherAttachmentLabel = await upload("other");
    expect(otherAttachmentLabel).not.toHaveClass("text-destructive");
  });
});
