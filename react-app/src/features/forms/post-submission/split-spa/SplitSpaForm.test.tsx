import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setMockUsername, TEST_REVIEWER_USERNAME, TEST_SPA_ITEM_ID } from "mocks";
import { beforeAll, describe, expect, it } from "vitest";

import {
  mockApiRefinements,
  renderFormWithPackageSectionAsync,
  skipCleanup,
} from "@/utils/test-helpers";

import { SplitSpaForm } from "./index";

describe("SplitSpaForm", () => {
  let user;
  beforeAll(async () => {
    skipCleanup();
    mockApiRefinements();

    user = userEvent.setup();
    setMockUsername(TEST_REVIEWER_USERNAME);
    await renderFormWithPackageSectionAsync(<SplitSpaForm />, TEST_SPA_ITEM_ID, "Medicaid SPA");
  });

  it("should display `breadcrumbText`", async () => {
    expect(screen.getByText("Create new split SPA(s)")).toBeInTheDocument();
  });

  it("should display the original SPA ID and Authority Type", () => {
    const spaIdHeader = screen.getByText("SPA ID");
    expect(spaIdHeader).toBeInTheDocument();
    expect(spaIdHeader.nextSibling).toHaveTextContent(TEST_SPA_ITEM_ID);

    const authorityTypeHeader = screen.getByText("Type");
    expect(authorityTypeHeader).toBeInTheDocument();
    expect(authorityTypeHeader.nextElementSibling).toHaveTextContent("Medicaid SPA");
  });

  it("should allow user to select split count", () => {
    const splitCountSelect = screen.getByLabelText(/Select number of splits/);
    expect(splitCountSelect).toBeInTheDocument();
    expect(splitCountSelect).not.toHaveValue();
  });

  it("should not display the split spa ids or requestor fields if there is no splitCount", () => {
    expect(screen.queryByText(/SPAs after split/)).toBeNull();
    expect(
      screen.queryByLabelText(/These packages were added to OneMAC per request from/),
    ).toBeNull();
  });

  it("submit button should be disabled before splitCount is set", async () => {
    expect(screen.getByRole("button", { name: "Confirm & Split SPA" })).toBeDisabled();
  });

  it("should only display options 2-8 for splits", async () => {
    await user.click(screen.getByLabelText(/Select number of splits/));
    expect(screen.queryByRole("option", { name: "1" })).toBeNull();
    expect(screen.getByRole("option", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "3" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "4" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "5" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "6" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "7" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "8" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "9" })).toBeNull();
  });

  it("should display the split spa ids and request when a splitCount is selected", async () => {
    await user.click(screen.getByRole("option", { name: "3" }));

    await waitFor(() => expect(screen.getByText(/SPAs after split/)).toBeInTheDocument());
    expect(screen.getByTestId(`1. ${TEST_SPA_ITEM_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${TEST_SPA_ITEM_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${TEST_SPA_ITEM_ID}-B`)).toBeInTheDocument();

    expect(
      screen.getByLabelText(/These packages were added to OneMAC per request from/),
    ).toBeInTheDocument();
  });

  it("should handle changing the splitCount", async () => {
    await user.click(screen.getByLabelText(/Select number of splits/));
    await user.click(screen.getByRole("option", { name: "5" }));

    await waitFor(() => expect(screen.getByText(/SPAs after split/)).toBeInTheDocument());
    expect(screen.getByTestId(`1. ${TEST_SPA_ITEM_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${TEST_SPA_ITEM_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${TEST_SPA_ITEM_ID}-B`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${TEST_SPA_ITEM_ID}-C`)).toBeInTheDocument();
    expect(screen.getByTestId(`5. ${TEST_SPA_ITEM_ID}-D`)).toBeInTheDocument();
  });

  it("should keep the edited suffices when changing the splitCount", async () => {
    const spaId3 = screen.getByTestId(`3. ${TEST_SPA_ITEM_ID}-B`);
    await user.click(within(spaId3).getByRole("button", { name: "Edit" }));
    await user.type(within(spaId3).getByLabelText(`${TEST_SPA_ITEM_ID} split number 3`), "anana");
    await user.click(within(spaId3).getByRole("button", { name: "Save" }));

    expect(screen.getByTestId(`1. ${TEST_SPA_ITEM_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${TEST_SPA_ITEM_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${TEST_SPA_ITEM_ID}-Banana`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${TEST_SPA_ITEM_ID}-C`)).toBeInTheDocument();
    expect(screen.getByTestId(`5. ${TEST_SPA_ITEM_ID}-D`)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Select number of splits/));
    await user.click(screen.getByRole("option", { name: "3" }));

    await waitFor(() => expect(screen.getByText(/SPAs after split/)).toBeInTheDocument());
    screen.debug(screen.getByText(/SPAs after split/).parentElement);
    expect(screen.getByTestId(`1. ${TEST_SPA_ITEM_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${TEST_SPA_ITEM_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${TEST_SPA_ITEM_ID}-Banana`)).toBeInTheDocument();
  });

  it("submit button should be disabled before requestor is set", async () => {
    expect(screen.getByRole("button", { name: "Confirm & Split SPA" })).toBeDisabled();
  });

  it("should handle changing the requestor", async () => {
    await user.type(
      screen.getByLabelText(/These packages were added to OneMAC per request from/),
      "Jane Doe",
    );

    expect(
      screen.getByLabelText(/These packages were added to OneMAC per request from/),
    ).toHaveValue("Jane Doe");
  });

  it("submit button should be enabled after requestor is set", async () => {
    expect(screen.getByRole("button", { name: "Confirm & Split SPA" })).toBeEnabled();
  });
});
