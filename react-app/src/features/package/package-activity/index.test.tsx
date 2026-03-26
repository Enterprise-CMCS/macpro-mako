import { toBeEmptyDOMElement } from "@testing-library/jest-dom/matchers";
import { screen, waitFor } from "@testing-library/react";
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
      <PackageActivities id={draftSubmission.id} changelog={[]} submission={draftSubmission} />,
      draftSubmission.id,
    );

    expect(screen.getByText("Package Activity (1)")).toBeInTheDocument();
    expect(screen.getByText("Draft Saved By George Harrison")).toBeInTheDocument();
    expect(screen.getByText("CMS-179 Form")).toBeInTheDocument();
    expect(screen.getByText("SPA Pages")).toBeInTheDocument();
    expect(screen.getByText("cms-179.pdf")).toBeInTheDocument();
    expect(screen.getByText("spa-pages.pdf")).toBeInTheDocument();
    expect(screen.getByText("Download all attachments")).toBeInTheDocument();
    expect(screen.queryByText("Download section attachments")).not.toBeInTheDocument();
  });

  it("shows a single draft package activity for a text-only draft without download buttons", async () => {
    const draftSubmission = {
      id: "MD-26-0002-P",
      seatoolStatus: "Draft",
      submitterName: "George Harrison",
      draft: {
        savedAt: "2026-03-03T19:09:56.000Z",
        data: {
          additionalInformation: "Saved draft notes",
        },
      },
      changelog: [],
    } as unknown as opensearch.main.Document;

    await renderFormWithPackageSectionAsync(
      <PackageActivities id={draftSubmission.id} changelog={[]} submission={draftSubmission} />,
      draftSubmission.id,
    );

    expect(screen.getByText("Package Activity (1)")).toBeInTheDocument();
    expect(screen.getByText("Draft Saved By George Harrison")).toBeInTheDocument();
    expect(screen.getByText("Saved draft notes")).toBeInTheDocument();
    expect(screen.queryByText("Download all attachments")).not.toBeInTheDocument();
  });

  it("shows draft attachments and saved additional information together", async () => {
    const draftSubmission = {
      id: "MD-26-0003-P",
      seatoolStatus: "Draft",
      submitterName: "George Harrison",
      draft: {
        savedAt: "2026-03-03T19:09:56.000Z",
        data: {
          additionalInformation: "Please review the saved draft context.",
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
          },
        },
      },
      changelog: [],
    } as unknown as opensearch.main.Document;

    await renderFormWithPackageSectionAsync(
      <PackageActivities id={draftSubmission.id} changelog={[]} submission={draftSubmission} />,
      draftSubmission.id,
    );

    expect(screen.getByText("CMS-179 Form")).toBeInTheDocument();
    expect(screen.getByText("cms-179.pdf")).toBeInTheDocument();
    expect(screen.getByText("Please review the saved draft context.")).toBeInTheDocument();
    expect(screen.getByText("Download all attachments")).toBeInTheDocument();
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

  it("requests the all-attachments archive and opens the returned url", async () => {
    const onArchive = vi.fn(() => Promise.resolve("http://example.com/all.zip"));
    const openSpy = vi.spyOn(window, "open").mockImplementation(vi.fn());

    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      attachmentErrorMessage: undefined,
      archiveErrorMessage: undefined,
      loading: false,
      onArchive,
      onUrl: vi.fn(),
      error: null,
    }));

    const user = userEvent.setup();
    await renderFormWithPackageSectionAsync(
      <PackageActivities
        id={WITHDRAWN_CHANGELOG_ITEM_ID}
        changelog={WITHDRAW_APPK_ITEM._source.changelog}
      />,
      WITHDRAWN_CHANGELOG_ITEM_ID,
    );

    await user.click(screen.getByText("Download all attachments"));

    expect(onArchive).toHaveBeenCalledWith({ scope: "all" });
    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith("http://example.com/all.zip");
    });
  });

  it("requests the section archive and opens the returned url", async () => {
    const onArchive = vi.fn(() => Promise.resolve("http://example.com/section.zip"));
    const openSpy = vi.spyOn(window, "open").mockImplementation(vi.fn());

    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      attachmentErrorMessage: undefined,
      archiveErrorMessage: undefined,
      loading: false,
      onArchive,
      onUrl: vi.fn(),
      error: null,
    }));

    const user = userEvent.setup();
    await renderFormWithPackageSectionAsync(
      <PackageActivities
        id={WITHDRAWN_CHANGELOG_ITEM_ID}
        changelog={TEST_ITEM_WITH_CHANGELOG._source.changelog}
      />,
      WITHDRAWN_CHANGELOG_ITEM_ID,
    );

    await user.click(screen.getByText("Download section attachments"));

    expect(onArchive).toHaveBeenCalledWith({
      scope: "section",
      sectionId: TEST_ITEM_WITH_CHANGELOG._source.changelog[0]._source.id,
    });
    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith("http://example.com/section.zip");
    });
  });

  it("calls the attachment name with onUrl and the correct attachment argument", async () => {
    const spiedOnUrl = vi.fn(() => Promise.resolve("hello world!"));
    const spiedWindowOpen = vi.fn();

    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      attachmentErrorMessage: undefined,
      archiveErrorMessage: undefined,
      onUrl: spiedOnUrl,
      loading: false,
      onArchive: vi.fn(),
      error: null,
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

  it("downloads all attachments for a synthetic draft package activity", async () => {
    const onArchive = vi.fn(() => Promise.resolve("http://example.com/draft-all.zip"));
    const openSpy = vi.spyOn(window, "open").mockImplementation(vi.fn());

    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      attachmentErrorMessage: undefined,
      archiveErrorMessage: undefined,
      loading: false,
      onArchive,
      onUrl: vi.fn(),
      error: null,
    }));

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
      <PackageActivities id={draftSubmission.id} changelog={[]} submission={draftSubmission} />,
      draftSubmission.id,
    );

    const user = userEvent.setup();
    await user.click(screen.getByText("Download all attachments"));

    expect(onArchive).toHaveBeenCalledWith({ scope: "all" });
    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith("http://example.com/draft-all.zip");
    });
    expect(screen.queryByText("Download section attachments")).not.toBeInTheDocument();
  });

  it("does not open a new tab when an attachment download resolves without a url", async () => {
    const onUrl = vi.fn(() => Promise.resolve(undefined));
    const openSpy = vi.spyOn(window, "open").mockImplementation(vi.fn());

    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      attachmentErrorMessage: undefined,
      archiveErrorMessage: undefined,
      onUrl,
      loading: false,
      onArchive: vi.fn(),
      error: null,
    }));

    const user = userEvent.setup();
    await renderFormWithPackageSectionAsync(
      <PackageActivities
        id={WITHDRAWN_CHANGELOG_ITEM_ID}
        changelog={WITHDRAW_APPK_ITEM._source.changelog}
      />,
      WITHDRAWN_CHANGELOG_ITEM_ID,
    );

    await user.click(screen.getByText("contract_amendment_2024.pdf"));

    expect(onUrl).toHaveBeenCalled();
    await waitFor(() => {
      expect(openSpy).not.toHaveBeenCalled();
    });
  });

  it("renders the individual attachment error message inline", async () => {
    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      attachmentErrorMessage: "This attachment is no longer available.",
      archiveErrorMessage: undefined,
      loading: false,
      onArchive: vi.fn(),
      onUrl: vi.fn(),
      error: null,
    }));

    await renderFormWithPackageSectionAsync(
      <PackageActivities
        id={WITHDRAWN_CHANGELOG_ITEM_ID}
        changelog={WITHDRAW_APPK_ITEM._source.changelog}
      />,
      WITHDRAWN_CHANGELOG_ITEM_ID,
    );

    expect(screen.getByText("This attachment is no longer available.")).toBeInTheDocument();
  });
});
