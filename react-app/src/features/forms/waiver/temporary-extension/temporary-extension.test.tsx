import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  EXISTING_ITEM_APPROVED_NEW_ID,
  EXISTING_ITEM_PENDING_ID,
  NOT_FOUND_ITEM_ID,
  TEST_SPA_ITEM_ID,
  VALID_ITEM_TEMPORARY_EXTENSION_ID,
} from "mocks";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import * as api from "@/api";
import * as components from "@/components";
import { formSchemas } from "@/formSchemas";
import { DataPoller } from "@/utils/Poller/DataPoller";
import * as documentPoller from "@/utils/Poller/documentPoller";
import { skipCleanup } from "@/utils/test-helpers";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";

import { TemporaryExtensionForm } from "./index";

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => flag === "SAVE_IN_PROGRESS",
}));

const upload = uploadFiles<(typeof formSchemas)["temporary-extension"]>();

describe("Temporary Extension", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("submit button stays disabled until a temporary extension type is selected", async () => {
    const user = userEvent.setup();

    await renderFormWithPackageSectionAsync(<TemporaryExtensionForm />);

    await user.type(
      screen.getByLabelText(/Approved Initial or Renewal Waiver Number/),
      EXISTING_ITEM_APPROVED_NEW_ID,
    );
    await user.type(
      screen.getByLabelText(/Temporary Extension Request Number/),
      VALID_ITEM_TEMPORARY_EXTENSION_ID,
    );

    const waiverExtensionRequestLabel = await upload("waiverExtensionRequest");
    expect(waiverExtensionRequestLabel).not.toHaveClass("text-destructive");

    expect(screen.getByTestId("submit-action-form")).toBeDisabled();
  });

  test("does not fetch the original waiver on initial render", async () => {
    const getItemSpy = vi.spyOn(api, "getItem");

    await renderFormWithPackageSectionAsync(<TemporaryExtensionForm />);

    expect(getItemSpy).not.toHaveBeenCalled();
  });

  test("save draft requires selecting a temporary extension type", async () => {
    const user = userEvent.setup();
    const saveDraftSpy = vi.spyOn(api, "saveDraft");
    const bannerSpy = vi.spyOn(components, "banner").mockImplementation(() => undefined);

    await renderFormWithPackageSectionAsync(<TemporaryExtensionForm />);

    await user.type(
      screen.getByLabelText(/Approved Initial or Renewal Waiver Number/),
      EXISTING_ITEM_APPROVED_NEW_ID,
    );
    await user.type(
      screen.getByLabelText(/Temporary Extension Request Number/),
      VALID_ITEM_TEMPORARY_EXTENSION_ID,
    );

    await upload("waiverExtensionRequest");
    await user.click(screen.getByTestId("save-draft-form"));

    await waitFor(() =>
      expect(bannerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          header: "Unable to save package",
          body: "Please select a Temporary Extension Type before saving.",
          variant: "destructive",
        }),
      ),
    );

    expect(saveDraftSpy).not.toHaveBeenCalled();
  });

  test("saves a draft when the approved waiver ID exists in SEA Tool without the local waiver format", async () => {
    const user = userEvent.setup();
    const saveDraftSpy = vi.spyOn(api, "saveDraft").mockResolvedValue({
      message: "Draft saved",
      id: "MD-6578.R00.TE01",
    });
    const itemExistsSpy = vi.spyOn(api, "itemExists").mockImplementation(async (id) => {
      return id === "MD.20230";
    });
    const idIsApprovedSpy = vi.spyOn(api, "idIsApproved").mockResolvedValue(true);
    const getItemSpy = vi.spyOn(api, "getItem").mockResolvedValue({
      _id: "MD.20230",
      found: true,
      _source: {
        id: "MD.20230",
        authority: "1915(b)",
      },
    } as any);

    await renderFormWithPackageSectionAsync(<TemporaryExtensionForm />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "1915(b)" }));
    await user.type(screen.getByLabelText(/Approved Initial or Renewal Waiver Number/), "MD.20230");
    await user.type(
      screen.getByLabelText(/Temporary Extension Request Number/),
      "MD-6578.R00.TE01",
    );
    await user.click(screen.getByTestId("save-draft-form"));

    await waitFor(() => expect(saveDraftSpy).toHaveBeenCalledTimes(1));
    expect(
      screen.queryByText(
        "The Approved Initial or Renewal Waiver Number must be in the format of SS-####.R##.00 or SS-#####.R##.00.",
      ),
    ).not.toBeInTheDocument();

    getItemSpy.mockRestore();
    idIsApprovedSpy.mockRestore();
    itemExistsSpy.mockRestore();
    saveDraftSpy.mockRestore();
  });

  test("shows a state-prefix validation error before saving a temporary extension draft", async () => {
    const user = userEvent.setup();
    const saveDraftSpy = vi.spyOn(api, "saveDraft");

    await renderFormWithPackageSectionAsync(<TemporaryExtensionForm />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "1915(b)" }));
    await user.type(
      screen.getByLabelText(/Approved Initial or Renewal Waiver Number/),
      EXISTING_ITEM_APPROVED_NEW_ID,
    );
    await user.type(
      screen.getByLabelText(/Temporary Extension Request Number/),
      "VA-6578.R00.TE02",
    );
    await user.click(screen.getByTestId("save-draft-form"));

    expect(
      await screen.findByText(
        "The Temporary Extension Request Number must start with MD to match the Approved Initial or Renewal Waiver Number.",
      ),
    ).toBeInTheDocument();
    expect(saveDraftSpy).not.toHaveBeenCalled();

    saveDraftSpy.mockRestore();
  });

  test("shows state access validation for the approved waiver number before existence validation", async () => {
    const user = userEvent.setup();
    const saveDraftSpy = vi.spyOn(api, "saveDraft");

    await renderFormWithPackageSectionAsync(<TemporaryExtensionForm />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "1915(b)" }));
    await user.type(
      screen.getByLabelText(/Approved Initial or Renewal Waiver Number/),
      "AK-1234.R00.00",
    );
    await user.type(
      screen.getByLabelText(/Temporary Extension Request Number/),
      "MD-6578.R00.TE02",
    );
    await user.click(screen.getByTestId("save-draft-form"));

    expect(
      await screen.findByText(
        "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "According to our records, this Approved Initial or Renewal Waiver Number does not yet exist. Please check the Approved Initial or Renewal Waiver Number and try entering it again.",
      ),
    ).not.toBeInTheDocument();
    expect(saveDraftSpy).not.toHaveBeenCalled();

    saveDraftSpy.mockRestore();
  });

  test("EXISTING WAIVER ID", async () => {
    // set the Item Id to TEST_ITEM_ID
    await renderFormWithPackageSectionAsync(
      <TemporaryExtensionForm />,
      TEST_SPA_ITEM_ID,
      "Medicaid SPA",
    );

    const temporaryExtensionValue = await vi.waitUntil(() => screen.getByText("Medicaid SPA"));
    const temporaryExtensionLabel = screen.getByText(/Temporary Extension Type/);

    // ensure Temporary Extension label and value exist and are in correct order
    expect(temporaryExtensionLabel.compareDocumentPosition(temporaryExtensionValue)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    const approvedInitialAndRenewalLabel = screen.getByText(
      "Approved Initial or Renewal Waiver Number",
    );
    // grab second TEST_ITEM_ID (first one is in the breadcrumbs)
    const approvedInitialAndRenewalValue = screen.getAllByText(TEST_SPA_ITEM_ID)[1];

    // ensure Approved Initial and Renewal label and value exist and are in correct order
    expect(
      approvedInitialAndRenewalLabel.compareDocumentPosition(approvedInitialAndRenewalValue),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  test("enables submit when creating from an approved existing waiver", async () => {
    const user = userEvent.setup();

    await renderFormWithPackageSectionAsync(
      <TemporaryExtensionForm />,
      EXISTING_ITEM_APPROVED_NEW_ID,
      "1915(b)",
    );

    expect(screen.getByText("1915(b)")).toBeInTheDocument();
    expect(screen.getAllByText(EXISTING_ITEM_APPROVED_NEW_ID)[1]).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/Temporary Extension Request Number/),
      VALID_ITEM_TEMPORARY_EXTENSION_ID,
    );
    await upload("waiverExtensionRequest");

    await waitFor(() => expect(screen.getByTestId("submit-action-form")).toBeEnabled());
  });

  test("enables Save & Submit from the card choice path without saving a draft first", async () => {
    const user = userEvent.setup();
    const dataPollerSpy = vi.spyOn(DataPoller.prototype, "startPollingData").mockResolvedValue({
      correctDataStateFound: true,
      maxAttemptsReached: false,
    });
    const documentPollerSpy = vi.spyOn(documentPoller, "documentPoller");

    await renderFormWithPackageSectionAsync(
      <TemporaryExtensionForm />,
      undefined,
      "1915(b)",
      "origin=waivers",
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "1915(b)" }));
    await user.type(
      screen.getByLabelText(/Approved Initial or Renewal Waiver Number/),
      EXISTING_ITEM_APPROVED_NEW_ID,
    );
    await user.type(
      screen.getByLabelText(/Temporary Extension Request Number/),
      VALID_ITEM_TEMPORARY_EXTENSION_ID,
    );
    await upload("waiverExtensionRequest");

    await waitFor(() => expect(screen.getByTestId("submit-action-form")).toBeEnabled());
    expect(screen.getByTestId("submit-action-form")).toHaveTextContent("Save & Submit");

    fireEvent.submit(screen.getByTestId("submit-action-form"));

    await waitFor(() =>
      expect(documentPollerSpy).toHaveBeenCalledWith(
        VALID_ITEM_TEMPORARY_EXTENSION_ID,
        expect.any(Function),
        { includeDraft: false },
      ),
    );

    dataPollerSpy.mockRestore();
  });

  test("shows a state-prefix validation error before saving a draft", async () => {
    const user = userEvent.setup();
    const saveDraftSpy = vi.spyOn(api, "saveDraft");
    const itemExistsSpy = vi.spyOn(api, "itemExists");

    await renderFormWithPackageSectionAsync(
      <TemporaryExtensionForm />,
      undefined,
      "1915(b)",
      "origin=waivers",
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "1915(b)" }));
    await user.type(
      screen.getByLabelText(/Approved Initial or Renewal Waiver Number/),
      EXISTING_ITEM_APPROVED_NEW_ID,
    );
    await user.type(
      screen.getByLabelText(/Temporary Extension Request Number/),
      "OH-4878.R00.TE02",
    );

    await user.click(screen.getByTestId("save-draft-form"));

    expect(
      await screen.findByText(
        "The Temporary Extension Request Number must start with MD to match the Approved Initial or Renewal Waiver Number.",
      ),
    ).toBeInTheDocument();
    expect(saveDraftSpy).not.toHaveBeenCalled();
    expect(itemExistsSpy).not.toHaveBeenCalledWith("OH-4878.R00.TE02", { includeDrafts: true });

    itemExistsSpy.mockRestore();
    saveDraftSpy.mockRestore();
  });

  describe("New Temporary Extension", () => {
    const user = userEvent.setup();
    beforeAll(async () => {
      skipCleanup();

      await renderFormWithPackageSectionAsync(<TemporaryExtensionForm />);
    });

    test("TEMPORARY EXTENSION TYPE 1915(c)", async () => {
      const teTypeDropdown = screen.getByRole("combobox");

      await user.click(teTypeDropdown); // open dropdown

      const teOptionToClick = screen.getByRole("option", {
        name: "1915(c)",
      });

      await user.click(teOptionToClick); // click option

      await user.click(teTypeDropdown); // close dropdown

      expect(screen.getByRole("combobox")).toHaveTextContent("1915(c)");
    });

    test("TEMPORARY EXTENSION TYPE 1915(b)", async () => {
      const teTypeDropdown = screen.getByRole("combobox");

      await user.click(teTypeDropdown); // open dropdown

      const teOptionToClick = screen.getByRole("option", {
        name: "1915(b)",
      });

      await user.click(teOptionToClick); // click option

      await user.click(teTypeDropdown); // close dropdown

      expect(screen.getByRole("combobox")).toHaveTextContent("1915(b)");
    });

    test("APPROVED INITIAL OR RENEWAL WAIVER NUMBER", async () => {
      const waiverNumberInput = screen.getByLabelText(/Approved Initial or Renewal Waiver Number/);
      const waiverNumberLabel = screen.getByTestId("waiverNumber-label");

      // test record does not exist error occurs
      await user.type(waiverNumberInput, NOT_FOUND_ITEM_ID);
      const recordDoesNotExistError = screen.getByText(
        "According to our records, this Approved Initial or Renewal Waiver Number does not yet exist. Please check the Approved Initial or Renewal Waiver Number and try entering it again.",
      );
      expect(recordDoesNotExistError).toBeInTheDocument();
      await user.clear(waiverNumberInput);

      // test record is not approved error occurs
      await user.type(waiverNumberInput, EXISTING_ITEM_PENDING_ID);
      const recordIsNotApproved = screen.getByText(
        "According to our records, this Approved Initial or Renewal Waiver Number is not approved. You must supply an approved Initial or Renewal Waiver Number.",
      );
      expect(recordIsNotApproved).toBeInTheDocument();
      await user.clear(waiverNumberInput);

      await user.type(waiverNumberInput, EXISTING_ITEM_APPROVED_NEW_ID);

      expect(waiverNumberLabel).not.toHaveClass("text-destructive");
    });

    test("TEMPORARY EXTENSION REQUEST NUMBER", async () => {
      const requestNumberInput = screen.getByLabelText(/Temporary Extension Request Number/);
      const requestNumberLabel = screen.getByTestId("requestNumber-label");

      // invalid TE request format
      await user.type(requestNumberInput, EXISTING_ITEM_APPROVED_NEW_ID);
      const invalidRequestNumberError = screen.getByText(
        "The Temporary Extension Request Number must be in the format of SS-####.R##.TE## or SS-#####.R##.TE##",
      );
      expect(invalidRequestNumberError).toBeInTheDocument();
      await user.clear(requestNumberInput);

      await user.type(requestNumberInput, VALID_ITEM_TEMPORARY_EXTENSION_ID);

      expect(requestNumberLabel).not.toHaveClass("text-destructive");
    });

    test("WAIVER EXTENSION REQUEST", async () => {
      const cmsForm179PlanLabel = await upload("waiverExtensionRequest");
      expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
    });

    test("submit button is enabled", async () => {
      expect(screen.getByTestId("submit-action-form")).toBeEnabled();
    });
  });
});
