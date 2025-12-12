import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as components from "@/components";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";
import { renderWithQueryClient } from "@/utils/test-helpers";

import { Upload } from "./upload";
import * as upUtil from "./uploadUtilities";
vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));
const defaultProps = {
  dataTestId: "upload-component",
  files: [],
  setFiles: vi.fn(),
  setErrorMessage: vi.fn(),
  type: "CHIP Eligibility SPA Details",
};
const FILE_1 = "file-1";
const FILE_2 = "file-2";
const FILE_REMOVE = "file-to-remove";
const failUpload = "file-to-fail";
const files = [
  {
    key: FILE_1,
    title: `${FILE_1}.txt`,
    filename: `${FILE_1}.txt`,
    bucket: "bucket-1",
    uploadDate: Date.now(),
  },
  {
    key: FILE_REMOVE,
    title: `${FILE_REMOVE}.txt`,
    filename: `${FILE_REMOVE}.txt`,
    bucket: "bucket-1",
    uploadDate: Date.now(),
  },
  {
    key: FILE_2,
    title: `${FILE_2}.txt`,
    filename: `${FILE_2}.txt`,
    bucket: "bucket-1",
    uploadDate: Date.now(),
  },
];

describe("Upload", () => {
  const testIdSuffix = "upload";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with initial props", () => {
    renderWithQueryClient(<Upload {...defaultProps} />);
    expect(screen.getByTestId(`${defaultProps.dataTestId}-${testIdSuffix}`)).toBeInTheDocument();
    expect(screen.queryByText("Uploading...")).not.toBeInTheDocument();
  });

  it("uploads files correctly", async () => {
    renderWithQueryClient(<Upload {...defaultProps} />);

    const dropzone = screen.getByRole("presentation");
    const file = new File(["file contents"], "file.pdf", { type: "application/pdf" });

    Object.defineProperty(dropzone, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.drop(dropzone);

    await waitFor(() => {
      expect(defaultProps.setFiles).toHaveBeenCalledWith([
        {
          bucket: "hello",
          key: "world",
          filename: "file.pdf",
          title: "file",
          uploadDate: expect.any(Number), // Since it's a timestamp
        },
      ]);
    });
  });

  it("displays an error for unsupported file types", async () => {
    renderWithQueryClient(<Upload {...defaultProps} />);

    const dropzone = screen.getByRole("presentation");
    const file = new File(["file contents"], "file.exe", { type: "application/x-msdownload" });

    Object.defineProperty(dropzone, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.drop(dropzone);

    await waitFor(() => {
      expect(screen.getByText(`File "${file.name}" has an invalid type.`)).toBeInTheDocument();
    });
  });

  it("displays an error for a file that is too large", async () => {
    renderWithQueryClient(<Upload {...defaultProps} />);

    const dropzone = screen.getByRole("presentation");
    const file = new File(["file contents"], "file.txt", { type: "text/plain" });
    Object.defineProperty(file, "size", { value: 80 * 1024 * 1024 + 1 });
    Object.defineProperty(dropzone, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.drop(dropzone);

    await waitFor(() => {
      expect(screen.getByText(`File "file.txt" is too large to upload.`)).toBeInTheDocument();
    });
  });

  it("displays an error for a file that already is uploaded", async () => {
    const mockSetFiles = vi.fn();
    renderWithQueryClient(<Upload {...defaultProps} files={files} setFiles={mockSetFiles} />);

    const dropzone = screen.getByRole("presentation");
    const file = new File(["file contents"], `${FILE_1}.txt`, { type: "text/plain" });
    Object.defineProperty(dropzone, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.drop(dropzone);

    await waitFor(() => {
      expect(
        screen.getByText(`File with name "${FILE_1}.txt" already exists.`),
      ).toBeInTheDocument();
    });
  });
  it("displays an error because the file failed to upload", async () => {
    const mockSetFiles = vi.fn();
    renderWithQueryClient(<Upload {...defaultProps} files={files} setFiles={mockSetFiles} />);
    vi.spyOn(upUtil, "getPresignedUrl").mockImplementation(() => {
      throw new Error();
    });
    const dropzone = screen.getByRole("presentation");
    const file = new File(["file constents"], `${failUpload}.txt`, { type: "text/plain" });
    Object.defineProperty(dropzone, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.drop(dropzone);

    await waitFor(() => {
      expect(screen.getByText(`Failed to upload ${failUpload}.txt`)).toBeInTheDocument();
    });
  });

  it("does not display the dropzone when uploading", async () => {
    renderWithQueryClient(<Upload {...defaultProps} />);

    const dropzone = screen.getByTestId("upload-component-upload");
    const file = new File(["file contents"], "file.pdf", { type: "application/pdf" });

    Object.defineProperty(dropzone, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.drop(dropzone);

    await waitFor(() => {
      expect(screen.queryByTestId("upload-component-upload")).not.toBeInTheDocument();
    });
  });

  it("shows file removal confirmation", async () => {
    const mockSetFiles = vi.fn();
    const onAcceptMock = vi.fn();
    const userPromptSpy = vi
      .spyOn(components, "userPrompt")
      .mockImplementation((args) => (args.onAccept = onAcceptMock));
    const user = userEvent.setup();

    renderWithQueryClient(<Upload {...defaultProps} files={files} setFiles={mockSetFiles} />);

    const removeButton = screen.getByTestId(`upload-component-remove-file-${FILE_REMOVE}.txt`);
    await user.click(removeButton);

    expect(userPromptSpy).toBeCalledWith({
      header: "Remove Attachment?",
      body: `Are you sure you want to remove ${FILE_REMOVE}.txt?`,
      acceptButtonText: "Yes, remove",
      onAccept: onAcceptMock,
    });
  });

  it("uploads files correctly and triggers GA event for", async () => {
    vi.spyOn(upUtil, "getPresignedUrl").mockResolvedValue("https://bucket.s3.amazonaws.com/world");
    vi.spyOn(upUtil, "uploadToS3").mockResolvedValue(undefined);
    vi.spyOn(upUtil, "extractBucketAndKeyFromUrl").mockReturnValue({
      bucket: "hello",
      key: "world",
    });

    renderWithQueryClient(<Upload {...defaultProps} type="CHIP SPA Details" />);

    const dropzone = screen.getByRole("presentation");
    dropzone.setAttribute("data-label", "attachment"); // for file_type value

    const file = new File(["file contents"], "file.pdf", { type: "application/pdf" });

    Object.defineProperty(dropzone, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.drop(dropzone);

    await waitFor(() => {
      expect(defaultProps.setFiles).toHaveBeenCalledWith([
        {
          bucket: "hello",
          key: "world",
          filename: "file.pdf",
          title: "file",
          uploadDate: expect.any(Number),
        },
      ]);
    });

    expect(sendGAEvent).toHaveBeenCalledWith("submit_file_upload", {
      submission_type: "chip spa",
      file_type: "attachment",
      file_size_bytes: file.size,
    });
  });
});
