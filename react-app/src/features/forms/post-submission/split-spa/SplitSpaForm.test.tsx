import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setMockUsername, TEST_REVIEWER_USERNAME, TEST_SPA_ITEM_ID } from "mocks";
import { beforeEach, describe, expect, it } from "vitest";

import { mockApiRefinements, renderFormWithPackageSectionAsync } from "@/utils/test-helpers";

import { SplitSpaForm } from "./index";

describe("SplitSpaForm", () => {
  let user: ReturnType<typeof userEvent.setup>;

  const selectSplitCount = async (value: string) => {
    await user.click(screen.getByLabelText(/Select number of splits/));
    await user.click(await screen.findByRole("option", { name: value }));
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: value })).not.toBeInTheDocument(),
    );
  };

  beforeEach(async () => {
    mockApiRefinements();

    user = userEvent.setup();
    setMockUsername(TEST_REVIEWER_USERNAME);
    await renderFormWithPackageSectionAsync(<SplitSpaForm />, TEST_SPA_ITEM_ID, "Medicaid SPA");
  });

  it("should display the initial split SPA form", async () => {
    expect(screen.getByText("Create new split SPA(s)")).toBeInTheDocument();

    const spaIdHeader = screen.getByText("SPA ID");
    expect(spaIdHeader).toBeInTheDocument();
    expect(spaIdHeader.nextSibling).toHaveTextContent(TEST_SPA_ITEM_ID);

    const authorityTypeHeader = screen.getByText("Type");
    expect(authorityTypeHeader).toBeInTheDocument();
    expect(authorityTypeHeader.nextElementSibling).toHaveTextContent("Medicaid SPA");

    const splitCountSelect = screen.getByLabelText(/Select number of splits/);
    expect(splitCountSelect).toBeInTheDocument();
    expect(splitCountSelect).not.toHaveValue();

    expect(screen.queryByText(/SPAs after split/)).toBeNull();
    expect(
      screen.queryByLabelText(/These packages were added to OneMAC per request from/),
    ).toBeNull();
    expect(screen.getByRole("button", { name: "Confirm & Split SPA" })).toBeDisabled();

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

    await user.click(screen.getByRole("option", { name: "2" }));
  });

  it("should display and update generated split SPA IDs", async () => {
    await selectSplitCount("3");

    await waitFor(() => expect(screen.getByText(/SPAs after split/)).toBeInTheDocument());
    expect(screen.getByTestId(`1. ${TEST_SPA_ITEM_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${TEST_SPA_ITEM_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${TEST_SPA_ITEM_ID}-B`)).toBeInTheDocument();

    expect(
      screen.getByLabelText(/These packages were added to OneMAC per request from/),
    ).toBeInTheDocument();

    await selectSplitCount("5");

    await waitFor(() => expect(screen.getByText(/SPAs after split/)).toBeInTheDocument());
    expect(screen.getByTestId(`1. ${TEST_SPA_ITEM_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${TEST_SPA_ITEM_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${TEST_SPA_ITEM_ID}-B`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${TEST_SPA_ITEM_ID}-C`)).toBeInTheDocument();
    expect(screen.getByTestId(`5. ${TEST_SPA_ITEM_ID}-D`)).toBeInTheDocument();

    const spaId3 = screen.getByTestId(`3. ${TEST_SPA_ITEM_ID}-B`);
    await user.click(within(spaId3).getByRole("button", { name: "Edit" }));
    await user.type(within(spaId3).getByLabelText(`${TEST_SPA_ITEM_ID} split number 3`), "anana");
    await user.click(within(spaId3).getByRole("button", { name: "Save" }));

    expect(screen.getByTestId(`1. ${TEST_SPA_ITEM_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${TEST_SPA_ITEM_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${TEST_SPA_ITEM_ID}-Banana`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${TEST_SPA_ITEM_ID}-C`)).toBeInTheDocument();
    expect(screen.getByTestId(`5. ${TEST_SPA_ITEM_ID}-D`)).toBeInTheDocument();

    await selectSplitCount("3");

    await waitFor(() => expect(screen.getByText(/SPAs after split/)).toBeInTheDocument());
    expect(screen.getByTestId(`1. ${TEST_SPA_ITEM_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${TEST_SPA_ITEM_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${TEST_SPA_ITEM_ID}-Banana`)).toBeInTheDocument();
  });

  it("should require a requestor before enabling submission", async () => {
    await selectSplitCount("3");

    expect(screen.getByRole("button", { name: "Confirm & Split SPA" })).toBeDisabled();
    await user.type(
      screen.getByLabelText(/These packages were added to OneMAC per request from/),
      "Jane Doe",
    );

    expect(
      screen.getByLabelText(/These packages were added to OneMAC per request from/),
    ).toHaveValue("Jane Doe");

    expect(screen.getByRole("button", { name: "Confirm & Split SPA" })).toBeEnabled();
  });
});
