import { Upload } from "./upload";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithQueryClient } from "@/utils/test-helpers/renderForm";

const defaultProps = {
  dataTestId: "upload-component",
  files: [],
  setFiles: vi.fn(),
  setErrorMessage: vi.fn(),
};

const files = [
  {
    key: "file-1",
    title: "file-1.txt",
    filename: "file-1.txt",
    bucket: "bucket-1",
    uploadDate: Date.now(),
  },
  {
    key: "file-to-remove",
    title: "file-to-remove.txt",
    filename: "file-to-remove.txt",
    bucket: "bucket-1",
    uploadDate: Date.now(),
  },
  {
    key: "file-2",
    title: "file-2.txt",
    filename: "file-2.txt",
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
      expect(
        screen.getByText("Selected file(s) is too large or of a disallowed file type."),
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
    const removeButton = screen.getByTestId("upload-component-remove-file-file-to-remove.txt"); // Ensure your component uses this testId
    fireEvent.click(removeButton);

    // Assert that setFiles was called with the updated files array
    expect(mockSetFiles).toHaveBeenCalledWith(
      files.filter((file) => file.filename !== "file-to-remove.txt"),
    );
  });
});
