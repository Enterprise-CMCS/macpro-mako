import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  EXISTING_ITEM_APPROVED_NEW_ID,
  EXISTING_ITEM_PENDING_ID,
  NOT_FOUND_ITEM_ID,
  TEST_SPA_ITEM_ID,
  VALID_ITEM_TEMPORARY_EXTENSION_ID,
} from "mocks";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { formSchemas } from "@/formSchemas";
import {
  renderFormWithPackageSectionAsync,
} from "@/utils/test-helpers/renderForm";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";

import { TemporaryExtensionForm } from "./index";

const upload = uploadFiles<(typeof formSchemas)["temporary-extension"]>();

describe("Temporary Extension", () => {
  afterEach(() => {
    vi.clearAllMocks();
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

  
});
