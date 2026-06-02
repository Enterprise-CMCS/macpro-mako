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
