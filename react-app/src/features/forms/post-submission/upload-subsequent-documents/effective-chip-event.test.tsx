import { cleanup, screen } from "@testing-library/react";
import { NEW_CHIP_ITEM_ID, onceApiItemHandler, TEST_CHIP_SPA_ITEM } from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { opensearch } from "shared-types";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";

import { UploadSubsequentDocuments } from ".";

describe("Upload Subsequent Documents for backend-converted CHIP Eligibility packages", () => {
  beforeEach(() => {
    cleanup();
    delete process.env.SKIP_CLEANUP;
  });

  afterEach(() => {
    delete process.env.SKIP_CLEANUP;
  });

  it("uses CHIP Eligibility attachment types when chipSubmissionType is added after initial submission", async () => {
    mockedServer.use(
      onceApiItemHandler({
        ...TEST_CHIP_SPA_ITEM,
        _source: {
          ...TEST_CHIP_SPA_ITEM._source,
          event: "new-chip-details-submission",
          chipSubmissionType: ["Non-Financial Eligibility"],
          changelog: [
            ...(TEST_CHIP_SPA_ITEM._source.changelog ?? []),
            {
              _id: `${NEW_CHIP_ITEM_ID}-0002`,
              _source: {
                id: `${NEW_CHIP_ITEM_ID}-0002`,
                packageId: NEW_CHIP_ITEM_ID,
                event: "update-values",
                isAdminChange: true,
              },
            },
          ],
        },
      } as opensearch.main.ItemResult),
    );

    await renderFormWithPackageSectionAsync(
      <UploadSubsequentDocuments />,
      NEW_CHIP_ITEM_ID,
      "CHIP SPA",
    );

    expect(screen.getByTestId("detail-section-title")).toHaveTextContent(
      "CHIP Eligibility SPA Subsequent Documents Details",
    );
    expect(screen.getByTestId("attachment-section-title")).toHaveTextContent(
      "Subsequent CHIP Eligibility SPA Documents",
    );
    expect(screen.getByTestId("chipEligibility-label")).toHaveTextContent(
      "CHIP Eligibility Template",
    );
    expect(screen.queryByText("Subsequent CHIP SPA Documents")).not.toBeInTheDocument();
  });
});

describe("Upload Subsequent Documents for legacy packages", () => {
  beforeEach(() => {
    cleanup();
    delete process.env.SKIP_CLEANUP;
  });

  afterEach(() => {
    delete process.env.SKIP_CLEANUP;
  });

  it("uses the package authority when the changelog has no initial submission event", async () => {
    const id = "TX-21-0009";

    mockedServer.use(
      onceApiItemHandler({
        _id: id,
        found: true,
        _source: {
          id,
          actionType: "New",
          authority: "Medicaid SPA",
          origin: "OneMACLegacy",
          changelog: [
            {
              _id: `${id}-313433`,
              _source: {
                id: `${id}-313433`,
                packageId: id,
                event: "respond-to-rai",
                timestamp: 1781214697656,
              },
            },
            {
              _id: `${id}-legacy-1741902359431`,
              _source: {
                id: `${id}-legacy-1741902359431`,
                packageId: id,
                event: "respond-to-rai",
                timestamp: 1741902359431,
              },
            },
          ],
        },
      } as opensearch.main.ItemResult),
    );

    await renderFormWithPackageSectionAsync(<UploadSubsequentDocuments />, id, "Medicaid SPA");

    expect(screen.queryByRole("heading", { name: "dashboard test" })).not.toBeInTheDocument();
    expect(screen.getByTestId("detail-section-title")).toHaveTextContent(
      "Medicaid SPA Subsequent Documents Details",
    );
    expect(screen.getByTestId("cmsForm179-label")).toHaveTextContent("CMS-179 Form");
  });
});
