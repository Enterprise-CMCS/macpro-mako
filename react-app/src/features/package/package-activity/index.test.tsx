import { describe, expect, it, vi, beforeEach } from "vitest";
import { PackageActivities } from ".";
import { renderFormWithPackageSection } from "@/utils/test-helpers/renderForm";
import { screen } from "@testing-library/react";
import * as api from "@/api";
import * as packageActivityHooks from "./hook";
import userEvent from "@testing-library/user-event";
import { toBeEmptyDOMElement } from "@testing-library/jest-dom/matchers";

vi.mock("@/api", async (importOriginals) => ({
  ...(await importOriginals()),
  useGetItem: vi.fn(() => ({
    data: {
      _source: {
        changelog: [
          {
            _source: {
              packageId: "0001",
              id: "20001",
              event: "capitated-amendment",
              attachments: [
                {
                  key: "doc001",
                  title: "Contract Amendment",
                  filename: "contract_amendment_2024.pdf",
                },
              ],
              additionalInformation: "Amendment to the capitated contract terms for 2024.",
              timestamp: 1672531200000, // Jan 1, 2023, in milliseconds
              isAdminChange: false,
            },
          },
          {
            _source: {
              packageId: "0002",
              id: "20002",
              event: "respond-to-rai",
              attachments: [
                {
                  key: "rai002",
                  title: "Response to RAI",
                  filename: "rai_response.docx",
                },
              ],
              additionalInformation: "Detailed response to the request for additional information.",
              timestamp: 1675123200000, // Feb 1, 2023
              isAdminChange: false,
            },
          },
          {
            _source: {
              packageId: "0003",
              id: "20003",
              event: "upload-subsequent-documents",
              attachments: [
                {
                  key: "subdoc003",
                  title: "Follow-Up Documents",
                  filename: "followup_docs.zip",
                },
              ],
              additionalInformation: "Supporting documents uploaded as follow-up.",
              timestamp: 1677715200000, // Mar 1, 2023
              isAdminChange: false,
            },
          },
          {
            _source: {
              packageId: "0004",
              id: "20004",
              event: "upload-subsequent-documents",
              attachments: [
                {
                  key: "subdoc004",
                  title: "Compliance Files",
                  filename: "compliance_documents.xlsx",
                },
              ],
              additionalInformation: "Compliance review files uploaded.",
              timestamp: 1680307200000, // Apr 1, 2023
              isAdminChange: false,
            },
          },
          {
            _source: {
              packageId: "0005",
              id: "20005",
              event: "withdraw-rai",
              attachments: [
                {
                  key: "withdraw005",
                  title: "Withdrawal Notice",
                  filename: "rai_withdrawal_notice.pdf",
                },
              ],
              additionalInformation: "Official notice of RAI withdrawal submitted.",
              timestamp: 1682899200000, // May 1, 2023
              isAdminChange: true,
            },
          },
          {
            _source: {
              packageId: "0006",
              id: "20006",
              event: "withdraw-package",
              attachments: [
                {
                  key: "withdraw006",
                  title: "Package Withdrawal",
                  filename: "package_withdrawal_request.docx",
                },
              ],
              additionalInformation: "Package has been withdrawn from submission pipeline.",
              timestamp: 1685491200000, // Jun 1, 2023
              isAdminChange: true,
            },
          },
          {
            _source: {
              packageId: "0007",
              id: "20007",
              event: "event-not-specified",
              attachments: [
                {
                  key: "misc007",
                  title: "Miscellaneous File",
                  filename: "miscellaneous_info.txt",
                },
              ],
              additionalInformation: "Uncategorized file upload.",
              timestamp: null, // Missing timestamp to simulate incomplete data
              isAdminChange: false,
            },
          },
        ],
      },
    },
  })),
  useGetUser: () => ({
    data: {
      user: {
        "custom:cms-roles": "onemac-micro-statesubmitter,onemac-micro-super",
      },
    },
  }),
}));

describe("Package Activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing if submission is not queried", () => {
    // @ts-expect-error - TS expects the whole object typed out
    vi.spyOn(api, "useGetItem").mockImplementationOnce(() => ({
      data: undefined,
    }));

    renderFormWithPackageSection(<PackageActivities />);

    expect(toBeEmptyDOMElement);
  });

  it("displays the correct title and description if changelog length is 0", () => {
    vi.spyOn(api, "useGetItem").mockImplementationOnce(() => ({
      data: {
        // @ts-expect-error - TS expects the whole object typed out
        _source: {
          changelog: [],
        },
      },
    }));

    renderFormWithPackageSection(<PackageActivities />);

    expect(screen.getByText("Package Activity (0)"));
    expect(screen.getByText("No package activity recorded"));
    expect(screen.queryByText("Download all documents")).not.toBeInTheDocument();
  });

  it("displays the correct title with changelog length, a changelog entry, and the 'Download all documents' button", () => {
    renderFormWithPackageSection(<PackageActivities />);

    expect(screen.getByText("Package Activity (5)"));
    expect(screen.getByText("Initial package submitted"));
    expect(screen.getByText("Download all documents"));
    expect(screen.getByText("Contract Amendment"));
  });

  it("calls 'Download all documents' with onZip and the correct attachment arguments", async () => {
    const spiedOnZip = vi.fn();

    // @ts-ignore
    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      onZip: spiedOnZip,
      loading: false,
    }));

    renderFormWithPackageSection(<PackageActivities />);

    const downloadAllDocumentsBtn = screen.getByText("Download all documents");
    await userEvent.click(downloadAllDocumentsBtn);

    expect(spiedOnZip).toBeCalledWith([
      {
        filename: "contract_amendment_2024.pdf",
        key: "doc001",
        title: "Contract Amendment",
      },
      {
        filename: "rai_response.docx",
        key: "rai002",
        title: "Response to RAI",
      },
      {
        filename: "followup_docs.zip",
        key: "subdoc003",
        title: "Follow-Up Documents",
      },
      {
        filename: "compliance_documents.xlsx",
        key: "subdoc004",
        title: "Compliance Files",
      },
      {
        filename: "miscellaneous_info.txt",
        key: "misc007",
        title: "Miscellaneous File",
      },
    ]);
  });

  it("calls 'Download documents' with onZip and the correct attachment arguments", async () => {
    const spiedOnZip = vi.fn();

    // @ts-ignore
    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      onZip: spiedOnZip,
      loading: false,
    }));

    renderFormWithPackageSection(<PackageActivities />);

    const downloadDocumentsBtn = screen.getByText("Download documents");
    await userEvent.click(downloadDocumentsBtn);

    expect(spiedOnZip).toBeCalledWith([
      {
        filename: "contract_amendment_2024.pdf",
        key: "doc001",
        title: "Contract Amendment",
      },
    ]);
  });

  it("calls the attachment name with onUrl and the correct attachment argument", async () => {
    const spiedOnUrl = vi.fn(() => Promise.resolve("hello world!"));
    const spiedWindowOpen = vi.fn();

    // @ts-ignore
    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      onUrl: spiedOnUrl,
      loading: false,
    }));

    vi.spyOn(window, "open").mockImplementation(spiedWindowOpen);

    renderFormWithPackageSection(<PackageActivities />);

    const firstDocumentBtn = screen.getByText("contract_amendment_2024.pdf");
    await userEvent.click(firstDocumentBtn);

    expect(spiedOnUrl).toBeCalledWith({
      filename: "contract_amendment_2024.pdf",
      key: "doc001",
      title: "Contract Amendment",
    });
    expect(spiedWindowOpen).toBeCalledWith("hello world!");
  });
});
