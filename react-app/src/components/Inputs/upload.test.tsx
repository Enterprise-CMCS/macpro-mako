import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithQueryClient } from "@/utils/test-helpers";

import { Upload } from "./upload";

const defaultProps = {
  dataTestId: "upload-component",
  files: [],
  setFiles: vi.fn(),
  setErrorMessage: vi.fn(),
};
const FILE_1 = "file-1";
const FILE_2 = "file-2";
const FILE_REMOVE = "file-to-remove";
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
      expect(screen.getByTestId("upload-component-upload")).not.toBeVisible();
    });
  });

  it("handles file removal on event", () => {
    const mockSetFiles = vi.fn();

    // Render the component with necessary props
    renderWithQueryClient(<Upload {...defaultProps} files={files} setFiles={mockSetFiles} />);

    // Simulate the event (e.g., a click on the remove button)
    const removeButton = screen.getByTestId(`upload-component-remove-file-${FILE_REMOVE}.txt`); // Ensure your component uses this testId
    fireEvent.click(removeButton);

    // Assert that setFiles was called with the updated files array
    expect(mockSetFiles).toHaveBeenCalledWith(
      files.filter((file) => file.filename !== `${FILE_REMOVE}.txt`),
    );
  });
});
