import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { onceApiItemHandler } from "mocks";
import { mockedApiServer } from "mocks/server";
import { CE_HARDSHIP_KIND_LABELS, opensearch } from "shared-types";
import { describe, expect, test } from "vitest";

import { formSchemas } from "@/formSchemas";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";
import { mockApiRefinements, skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";

import { UploadSubsequentDocuments } from ".";
import { CENTRA_SUBSEQUENT_BANNER, CENTRA_SUBSEQUENT_PROMPT } from "./CentraSubsequentDocuments";

const PACKAGE_ID = "MD-CE-26-001";
const upload = uploadFiles<(typeof formSchemas)["ce-subsequent-documents"]>();

const centraItem = {
  _id: PACKAGE_ID,
  found: true,
  _source: {
    id: PACKAGE_ID,
    authority: "CE_HARDSHIP_EXCEPTION",
    event: "ce-record-submitted",
    hardshipKind: "CE_UNEMPLOYMENT",
    seatoolStatus: "Submitted",
  },
} as opensearch.main.ItemResult;

describe("CEntra upload subsequent documents", () => {
  test("shows the prefilled id and request type, then enables submit", async () => {
    skipCleanup();
    mockApiRefinements();
    mockedApiServer.use(onceApiItemHandler(centraItem));

    await renderFormWithPackageSectionAsync(
      <UploadSubsequentDocuments />,
      PACKAGE_ID,
      "CE_HARDSHIP_EXCEPTION",
    );

    expect(screen.getByText("New Subsequent Documentation")).toBeInTheDocument();
    expect(screen.getByTestId("ce-submission-id")).toHaveTextContent(PACKAGE_ID);
    expect(screen.getByTestId("ce-request-type")).toHaveTextContent(
      CE_HARDSHIP_KIND_LABELS.CE_UNEMPLOYMENT,
    );
    expect(screen.getByTestId("attachment-section-title")).toHaveTextContent(
      "Subsequent Documents",
    );
    expect(screen.getByTestId("ceTemplate-label")).toHaveTextContent("Template");
    expect(screen.getByTestId("other-label")).toHaveTextContent("Other Supporting Documentation");
    expect(
      screen.getByLabelText(/Explain why additional documents are being submitted/),
    ).toBeInTheDocument();
    expect(screen.getByTestId("submit-action-form")).toBeDisabled();

    await upload("other");
    expect(screen.getByTestId("submit-action-form")).toBeDisabled();

    await userEvent.type(
      screen.getByLabelText(/Explain why additional documents are being submitted/),
      "Adding the signed template.",
    );

    await waitFor(() => expect(screen.getByTestId("submit-action-form")).toBeEnabled());
    expect(CENTRA_SUBSEQUENT_PROMPT).toMatchObject({
      header: "Submit additional documents?",
      body: "These documents will be added to the submission and reviewed by CMS.",
      acceptButtonText: "Yes, Submit",
    });
    expect(CENTRA_SUBSEQUENT_BANNER.header).toBe("Documents submitted");
  });
});
