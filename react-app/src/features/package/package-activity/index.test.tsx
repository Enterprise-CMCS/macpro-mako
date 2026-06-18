import { toBeEmptyDOMElement } from "@testing-library/jest-dom/matchers";
import { screen, waitFor, within } from "@testing-library/react";
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
              label: "CMS-179 Form",
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
              label: "SPA Pages",
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
    expect(screen.getByText("Created By George Harrison")).toBeInTheDocument();
    expect(screen.getByText("CMS-179 Form")).toBeInTheDocument();
    expect(screen.getByText("SPA Pages")).toBeInTheDocument();
    expect(screen.getByText("cms-179.pdf")).toBeInTheDocument();
    expect(screen.getByText("spa-pages.pdf")).toBeInTheDocument();
    expect(screen.getByText("Download all attachments")).toBeInTheDocument();
    expect(screen.getByText("Download section attachments")).toBeInTheDocument();
  });

  it("orders draft attachment sections to match the form schema order", async () => {
    const draftSubmission = {
      id: "MD-25-0003-JJJ",
      event: "new-chip-details-submission",
      seatoolStatus: "Draft",
      submitterName: "George Harrison",
      draft: {
        savedAt: "2026-03-27T18:06:29.000Z",
        data: {
          attachments: {
            amendedLanguage: {
              label: "Amended Language",
              files: [
                {
                  filename: "amended-language.pdf",
                  key: "amended-language-key",
                  bucket: ATTACHMENT_BUCKET_NAME,
                  uploadDate: 1772564997000,
                },
              ],
            },
            chipEligibility: {
              label: "CHIP Eligibility Template",
              files: [
                {
                  filename: "chip-eligibility.pdf",
                  key: "chip-eligibility-key",
                  bucket: ATTACHMENT_BUCKET_NAME,
                  uploadDate: 1772564996000,
                },
              ],
            },
            coverLetter: {
              label: "Cover Letter",
              files: [
                {
                  filename: "cover-letter.pdf",
                  key: "cover-letter-key",
                  bucket: ATTACHMENT_BUCKET_NAME,
                  uploadDate: 1772564998000,
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

    const attachmentRows = screen
      .getAllByRole("row")
      .slice(1)
      .filter((row) => within(row).queryAllByRole("cell").length === 2);
    const documentTypes = attachmentRows.map(
      (row) => within(row).getAllByRole("cell")[0].textContent,
    );

    expect(documentTypes).toEqual([
      "CHIP Eligibility Template",
      "Cover Letter",
      "Amended Language",
    ]);
  });

  it("uses the saved draft attachment labels instead of internal attachment keys", async () => {
    const draftSubmission = {
      id: "MD-26-0004-P",
      seatoolStatus: "Draft",
      submitterName: "George Harrison",
      draft: {
        savedAt: "2026-03-03T19:09:56.000Z",
        data: {
          attachments: {
            appk: {
              label: "1915(c) Appendix K Amendment Waiver Template",
              files: [
                {
                  filename: "appendix-k.pdf",
                  key: "app-k-key",
                  bucket: ATTACHMENT_BUCKET_NAME,
                  uploadDate: 1772564996000,
                },
              ],
            },
            b4WaiverApplication: {
              label:
                "1915(b)(4) FFS Selective Contracting (Streamlined) Waiver Application Pre-print",
              files: [
                {
                  filename: "b4-application.pdf",
                  key: "b4-waiver-key",
                  bucket: ATTACHMENT_BUCKET_NAME,
                  uploadDate: 1772564997000,
                },
              ],
            },
            tribalConsultation: {
              label: "Tribal Consultation",
              files: [
                {
                  filename: "tribal-consultation.pdf",
                  key: "tribal-consultation-key",
                  bucket: ATTACHMENT_BUCKET_NAME,
                  uploadDate: 1772564998000,
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

    expect(screen.getByText("1915(c) Appendix K Amendment Waiver Template")).toBeInTheDocument();
    expect(
      screen.getByText(
        "1915(b)(4) FFS Selective Contracting (Streamlined) Waiver Application Pre-print",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Tribal Consultation")).toBeInTheDocument();
    expect(screen.queryByText("Appk")).not.toBeInTheDocument();
    expect(screen.queryByText("B4 Waiver Application")).not.toBeInTheDocument();
  });

  it("falls back to the event schema attachment label when a draft label is missing", async () => {
    const draftSubmission = {
      id: "MD-3422.R00.01",
      event: "app-k",
      seatoolStatus: "Draft",
      submitterName: "George Harrison",
      draft: {
        savedAt: "2026-03-03T19:09:56.000Z",
        data: {
          attachments: {
            appk: {
              files: [
                {
                  filename: "appendix-k.pdf",
                  key: "app-k-key",
                  bucket: ATTACHMENT_BUCKET_NAME,
                  uploadDate: 1772564996000,
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

    expect(screen.getByText("1915(c) Appendix K Amendment Waiver Template")).toBeInTheDocument();
    expect(screen.queryByText("Appk")).not.toBeInTheDocument();
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
    expect(screen.getByText("Created By George Harrison")).toBeInTheDocument();
    expect(screen.getByText("Saved draft notes")).toBeInTheDocument();
    expect(screen.queryByText("Download all attachments")).not.toBeInTheDocument();
  });

  it("shows created and latest updated draft activity when another user saved the draft", async () => {
    const user = userEvent.setup();
    const draftSubmission = {
      id: "MD-26-0005-P",
      seatoolStatus: "Draft",
      submitterName: "Ringo Starr",
      submitterEmail: "ringo@example.com",
      draft: {
        savedAt: "2026-03-03T19:09:56.000Z",
        createdAt: "2026-03-01T19:09:56.000Z",
        createdByName: "George Harrison",
        createdByEmail: "george@example.com",
        updatedAt: "2026-03-03T19:09:56.000Z",
        updatedByName: "Ringo Starr",
        updatedByEmail: "ringo@example.com",
        data: {
          additionalInformation: "Latest saved draft notes",
        },
      },
      changelog: [],
    } as unknown as opensearch.main.Document;

    await renderFormWithPackageSectionAsync(
      <PackageActivities id={draftSubmission.id} changelog={[]} submission={draftSubmission} />,
      draftSubmission.id,
    );

    expect(screen.getByText("Package Activity (2)")).toBeInTheDocument();
    expect(screen.getByText("Created By George Harrison")).toBeInTheDocument();
    expect(screen.getByText("Updated By Ringo Starr")).toBeInTheDocument();
    const activityButtons = screen.getAllByRole("button");
    expect(activityButtons[0]).toHaveTextContent("Updated By Ringo Starr");
    expect(activityButtons[1]).toHaveTextContent("Created By George Harrison");
    expect(screen.getByText("Latest saved draft notes")).toBeInTheDocument();

    await user.click(activityButtons[1]);

    expect(
      screen.getByText(
        "This draft creation record remains static. The latest saved documents and additional information are shown in the Updated By activity.",
      ),
    ).toBeInTheDocument();
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
              label: "CMS-179 Form",
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

  it("renders a legacy package activity when attachments are null", async () => {
    const changelogWithNullAttachments = [
      {
        _id: "MA-24-0013-legacy-1728481070295",
        _index: "productionchangelog",
        found: true,
        _source: {
          id: "MA-24-0013-legacy-1728481070295",
          packageId: "MA-24-0013",
          timestamp: 1728481070295,
          event: "legacy-withdraw-rai-request",
          attachments: null,
          additionalInformation:
            "Massachusetts is withdrawing the 24-0013 RAI Response submitted on 8/12/24 in order to allow for more time to discuss with CMS.",
          submitterEmail: "kaela.konefal@state.ma.us",
          submitterName: "Kaela Konefal",
          origin: "OneMACLegacy",
        },
      },
    ] as unknown as opensearch.changelog.ItemResult[];

    await renderFormWithPackageSectionAsync(
      <PackageActivities id="MA-24-0013" changelog={changelogWithNullAttachments} />,
      "MA-24-0013",
    );

    expect(screen.getByText("Package Activity (1)")).toBeInTheDocument();
    expect(screen.getByText("No information submitted")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Massachusetts is withdrawing the 24-0013 RAI Response submitted on 8/12/24 in order to allow for more time to discuss with CMS.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Download all attachments")).not.toBeInTheDocument();
  });

  it("requests the all-attachments archive and opens the returned url", async () => {
    const onArchive = vi.fn(() => Promise.resolve("http://example.com/all.zip"));
    const openSpy = vi.spyOn(window, "open").mockImplementation(vi.fn());

    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      attachmentErrorMessage: undefined,
      archiveErrorMessage: undefined,
      archiveWarningMessage: undefined,
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
      archiveWarningMessage: undefined,
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
      archiveWarningMessage: undefined,
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
      archiveWarningMessage: undefined,
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
    expect(screen.getByText("Download section attachments")).toBeInTheDocument();
  });

  it("downloads section attachments for a synthetic draft package activity", async () => {
    const onArchive = vi.fn(() => Promise.resolve("http://example.com/draft-section.zip"));
    const openSpy = vi.spyOn(window, "open").mockImplementation(vi.fn());

    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      attachmentErrorMessage: undefined,
      archiveErrorMessage: undefined,
      archiveWarningMessage: undefined,
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
    await user.click(screen.getByText("Download section attachments"));

    expect(onArchive).toHaveBeenCalledWith({
      scope: "section",
      sectionId: `${draftSubmission.id}-draft-activity`,
    });
    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith("http://example.com/draft-section.zip");
    });
  });

  it("does not open a new tab when an attachment download resolves without a url", async () => {
    const onUrl = vi.fn(() => Promise.resolve(undefined));
    const openSpy = vi.spyOn(window, "open").mockImplementation(vi.fn());

    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      attachmentErrorMessage: undefined,
      archiveErrorMessage: undefined,
      archiveWarningMessage: undefined,
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
      archiveWarningMessage: undefined,
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

  it("renders the archive error message inline for package downloads", async () => {
    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      attachmentErrorMessage: undefined,
      archiveErrorMessage:
        "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
      archiveWarningMessage: undefined,
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

    expect(
      screen.getAllByText(
        "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
      ).length,
    ).toBeGreaterThan(0);
  });

  it("renders the archive warning message inline for package downloads", async () => {
    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      attachmentErrorMessage: undefined,
      archiveErrorMessage: undefined,
      archiveWarningMessage:
        "Some attachments in this download are no longer available and were not included.",
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

    expect(
      screen.getAllByText(
        "Some attachments in this download are no longer available and were not included.",
      ).length,
    ).toBeGreaterThan(0);
  });

  it("uses consistent typography for attachment and archive status messages", async () => {
    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      attachmentErrorMessage: "This attachment is no longer available.",
      archiveErrorMessage:
        "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
      archiveWarningMessage: undefined,
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

    const statusMessages = screen.getAllByRole("alert");
    expect(statusMessages.length).toBeGreaterThan(0);

    statusMessages.forEach((message) => {
      expect(message).toHaveClass("text-sm");
      expect(message).toHaveClass("font-normal");
      expect(message).toHaveClass("text-red-700");
    });
  });
});
