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
import { opensearch } from "shared-types";
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
    expect(screen.queryByText("Download all attachments")).not.toBeInTheDocument();
  });

  it("shows a single draft package activity when a draft has saved attachments and no changelog", async () => {
    const draftSubmission = {
      id: "MD-26-0001-P",
      seatoolStatus: "Draft",
      submitterName: "George Harrison",
      makoChangedDate: "2026-03-03T19:09:56.000Z",
      draft: {
        savedAt: "2026-03-03T19:09:56.000Z",
        data: {
          attachments: {
            cmsForm179: {
              files: [
                {
                  filename: "cms-179.pdf",
                  key: "cms-179-key",
                  bucket: ATTACHMENT_BUCKET_NAME,
                  uploadDate: 1772564996000,
                  title: "cms-179",
                },
              ],
            },
            spaPages: {
              files: [
                {
                  filename: "spa-pages.pdf",
                  key: "spa-pages-key",
                  bucket: ATTACHMENT_BUCKET_NAME,
                  uploadDate: 1772564997000,
                  title: "spa-pages",
                },
              ],
            },
          },
        },
      },
      changelog: [],
    } as unknown as opensearch.main.Document;

    await renderFormWithPackageSectionAsync(
      <PackageActivities
        id={draftSubmission.id}
        changelog={[]}
        submission={draftSubmission}
      />,
      draftSubmission.id,
    );

    expect(screen.getByText("Package Activity (1)")).toBeInTheDocument();
    expect(screen.getByText("Draft Saved By George Harrison")).toBeInTheDocument();
    expect(screen.getByText("CMS-179 Form")).toBeInTheDocument();
    expect(screen.getByText("SPA Pages")).toBeInTheDocument();
    expect(screen.getByText("cms-179.pdf")).toBeInTheDocument();
    expect(screen.getByText("spa-pages.pdf")).toBeInTheDocument();
    expect(screen.queryByText("Download all attachments")).not.toBeInTheDocument();
    expect(screen.queryByText("Download section attachments")).not.toBeInTheDocument();
  });

  it("displays the correct title with changelog length, a changelog entry, and the 'Download all attachments' button", async () => {
    await renderFormWithPackageSectionAsync(
      <PackageActivities
        id={WITHDRAWN_CHANGELOG_ITEM_ID}
        changelog={WITHDRAW_APPK_ITEM._source.changelog}
      />,
      WITHDRAWN_CHANGELOG_ITEM_ID,
    );

    expect(screen.getByText("Package Activity (7)"));
    expect(screen.getByText("Initial Package Submitted By Bob Smith"));
    expect(screen.getByText("Download all attachments"));
    expect(screen.getByText("Contract Amendment"));
  });

  it("calls 'Download all attachments' with onZip and the correct attachment arguments", async () => {
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

    const downloadAllAttachmentsBtn = screen.getByText("Download all attachments");
    await user.click(downloadAllAttachmentsBtn);

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

  it("calls 'Download section attachments' with onZip and the correct attachment arguments", async () => {
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

    const downloadAttachmentsBtn = screen.getByText("Download section attachments");
    await user.click(downloadAttachmentsBtn);

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

  it("does not show download buttons for a synthetic draft package activity", async () => {
    const draftSubmission = {
      id: "MD-26-0001-P",
      seatoolStatus: "Draft",
      submitterName: "George Harrison",
      draft: {
        savedAt: "2026-03-03T19:09:56.000Z",
        data: {
          attachments: {
            cmsForm179: {
              files: [
                {
                  filename: "cms-179.pdf",
                  key: "cms-179-key",
                  bucket: ATTACHMENT_BUCKET_NAME,
                  uploadDate: 1772564996000,
                  title: "cms-179",
                },
              ],
            },
            spaPages: {
              files: [
                {
                  filename: "spa-pages.pdf",
                  key: "spa-pages-key",
                  bucket: ATTACHMENT_BUCKET_NAME,
                  uploadDate: 1772564997000,
                  title: "spa-pages",
                },
              ],
            },
          },
        },
      },
      changelog: [],
    } as unknown as opensearch.main.Document;

    await renderFormWithPackageSectionAsync(
      <PackageActivities
        id={draftSubmission.id}
        changelog={[]}
        submission={draftSubmission}
      />,
      draftSubmission.id,
    );

    expect(screen.queryByText("Download all attachments")).not.toBeInTheDocument();
    expect(screen.queryByText("Download section attachments")).not.toBeInTheDocument();
  });
});
