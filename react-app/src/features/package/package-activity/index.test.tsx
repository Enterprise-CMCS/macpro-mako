import { toBeEmptyDOMElement } from "@testing-library/jest-dom/matchers";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ATTACHMENT_BUCKET_NAME,
  MISSING_CHANGELOG_ITEM_ID,
  setDefaultStateSubmitter,
  TEST_ITEM_WITH_CHANGELOG,
  WITHDRAW_APPK_ITEM,
  WITHDRAWN_CHANGELOG_ITEM_ID,
} from "mocks";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";

import { PackageActivities } from ".";
import * as packageActivityHooks from "./hook";

describe("Package Activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setDefaultStateSubmitter();
  });

  it("renders nothing if submission is not queried", async () => {
    await renderFormWithPackageSectionAsync(
      <PackageActivities id={MISSING_CHANGELOG_ITEM_ID} changelog={[]} />,
      MISSING_CHANGELOG_ITEM_ID,
    );

    expect(toBeEmptyDOMElement);
  });

  it("displays the correct title and description if changelog length is 0", async () => {
    await renderFormWithPackageSectionAsync(
      <PackageActivities id={MISSING_CHANGELOG_ITEM_ID} changelog={[]} />,
      MISSING_CHANGELOG_ITEM_ID,
    );

    expect(screen.getByText("Package Activity (0)"));
    expect(screen.getByText("No package activity recorded"));
    expect(screen.queryByText("Download all documents")).not.toBeInTheDocument();
  });

  it("displays the correct title with changelog length, a changelog entry, and the 'Download all documents' button", async () => {
    await renderFormWithPackageSectionAsync(
      <PackageActivities
        id={WITHDRAWN_CHANGELOG_ITEM_ID}
        changelog={WITHDRAW_APPK_ITEM._source.changelog}
      />,
      WITHDRAWN_CHANGELOG_ITEM_ID,
    );

    expect(screen.getByText("Package Activity (7)"));
    expect(screen.getByText("Initial Package Submitted"));
    expect(screen.getByText("Download all documents"));
    expect(screen.getByText("Contract Amendment"));
  });

  it("calls 'Download all documents' with onZip and the correct attachment arguments", async () => {
    const spiedOnZip = vi.fn();

    // @ts-expect-error
    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      onZip: spiedOnZip,
      loading: false,
    }));

    const user = userEvent.setup();
    await renderFormWithPackageSectionAsync(
      <PackageActivities
        id={WITHDRAWN_CHANGELOG_ITEM_ID}
        changelog={WITHDRAW_APPK_ITEM._source.changelog}
      />,
      WITHDRAWN_CHANGELOG_ITEM_ID,
    );

    const downloadAllDocumentsBtn = screen.getByText("Download all documents");
    await user.click(downloadAllDocumentsBtn);

    expect(spiedOnZip).toBeCalledWith([
      {
        filename: "contract_amendment_2024.pdf",
        key: "doc001",
        title: "Contract Amendment",
        bucket: ATTACHMENT_BUCKET_NAME,
      },
      {
        filename: "rai_response.docx",
        key: "rai002",
        title: "Response to RAI",
        bucket: ATTACHMENT_BUCKET_NAME,
      },
      {
        filename: "followup_docs.zip",
        key: "subdoc003",
        title: "Follow-Up Documents",
        bucket: ATTACHMENT_BUCKET_NAME,
      },
      {
        filename: "compliance_documents.xlsx",
        key: "subdoc004",
        title: "Compliance Files",
        bucket: ATTACHMENT_BUCKET_NAME,
      },
      {
        filename: "rai_withdrawal_notice.pdf",
        key: "withdraw005",
        title: "Withdrawal Notice",
        bucket: ATTACHMENT_BUCKET_NAME,
      },
      {
        filename: "package_withdrawal_request.docx",
        key: "withdraw006",
        title: "Package Withdrawal",
        bucket: ATTACHMENT_BUCKET_NAME,
      },
      {
        filename: "miscellaneous_info.txt",
        key: "misc007",
        title: "Miscellaneous File",
        bucket: ATTACHMENT_BUCKET_NAME,
      },
    ]);
  });

  it("calls 'Download documents' with onZip and the correct attachment arguments", async () => {
    const spiedOnZip = vi.fn();

    // @ts-expect-error
    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      onZip: spiedOnZip,
      loading: false,
    }));

    const user = userEvent.setup();
    await renderFormWithPackageSectionAsync(
      <PackageActivities
        id={WITHDRAWN_CHANGELOG_ITEM_ID}
        changelog={TEST_ITEM_WITH_CHANGELOG._source.changelog}
      />,
      WITHDRAWN_CHANGELOG_ITEM_ID,
    );

    const downloadDocumentsBtn = screen.getByText("Download documents");
    await user.click(downloadDocumentsBtn);

    expect(spiedOnZip).toBeCalledWith([
      {
        filename: "contract_amendment_2024.pdf",
        key: "doc001",
        title: "Contract Amendment",
        bucket: ATTACHMENT_BUCKET_NAME,
      },
      {
        filename: "contract_amendment_2024_2.pdf",
        key: "doc002",
        title: "Contract Amendment2",
        bucket: ATTACHMENT_BUCKET_NAME,
      },
    ]);
  });

  it("calls the attachment name with onUrl and the correct attachment argument", async () => {
    const spiedOnUrl = vi.fn(() => Promise.resolve("hello world!"));
    const spiedWindowOpen = vi.fn();

    // @ts-expect-error
    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      onUrl: spiedOnUrl,
      loading: false,
    }));

    vi.spyOn(window, "open").mockImplementation(spiedWindowOpen);

    const user = userEvent.setup();
    await renderFormWithPackageSectionAsync(
      <PackageActivities
        id={WITHDRAWN_CHANGELOG_ITEM_ID}
        changelog={WITHDRAW_APPK_ITEM._source.changelog}
      />,
      WITHDRAWN_CHANGELOG_ITEM_ID,
    );

    const firstDocumentBtn = screen.getByText("contract_amendment_2024.pdf");
    await user.click(firstDocumentBtn);

    expect(spiedOnUrl).toBeCalledWith({
      filename: "contract_amendment_2024.pdf",
      key: "doc001",
      title: "Contract Amendment",
      bucket: ATTACHMENT_BUCKET_NAME,
    });
    expect(spiedWindowOpen).toBeCalledWith("hello world!");
  });
});
