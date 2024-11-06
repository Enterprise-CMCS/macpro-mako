import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, beforeAll, vi, afterEach } from "vitest";
import * as MedicaidForm from "./Medicaid";
import { formSchemas } from "@/formSchemas";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import {
  skipCleanup,
  mockApiRefinements,
} from "@/utils/test-helpers/skipCleanup";
import { renderForm } from "@/utils/test-helpers/renderForm";
import * as documentPoller from "@/utils/Poller/documentPoller";
import { PackageCheck } from "shared-utils/package-check";

const upload = uploadFiles<(typeof formSchemas)["new-medicaid-submission"]>();

// use container globally for tests to use same render and let each test fill out inputs
// and at the end validate button is enabled for submit
let container: HTMLElement;

describe("Medicaid SPA", () => {
  beforeAll(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    skipCleanup();
    mockApiRefinements();

    const { container: renderedContainer } = renderForm(
      <MedicaidForm.MedicaidForm />,
    );

    container = renderedContainer;
  });

  afterEach(() => {
    vi.useRealTimers();
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

  test("does this work", async () => {});

  test("submission occurs", async () => {
    const mockStatusChecks = {
      recordExists: true,
      hasStatus: vi.fn(() => true),
    };

    let spy;

    vi.spyOn(documentPoller, "documentPoller")
      ///@ts-ignore - mocking documentPollerSpy expects private class members
      .mockImplementation((id, checker) => {
        spy = vi.spyOn({ checker }, "checker");
        return {
          startPollingData: vi.fn().mockResolvedValue({
            maxAttemptsReached: false,
            correctDataStateFound: true,
          }),
          options: {
            fetcher: vi.fn().mockResolvedValue({}),
            onPoll: vi.fn().mockImplementationOnce(() => {
              return spy(mockStatusChecks);
            }),
            pollAttempts: 5,
            interval: 100,
          },
        };
      });

    const form = container.querySelector("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });
});
