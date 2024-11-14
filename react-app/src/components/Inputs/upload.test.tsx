import { Upload } from "./upload";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { API } from "aws-amplify";
import exp from "constants";

// Mock global fetch
global.fetch = vi.fn();

// Mock AWS Amplify API
vi.mock("aws-amplify", () => ({
  API: {
    post: vi.fn(),
  },
}));

const defaultProps = {
  dataTestId: "upload-component",
  files: [],
  setFiles: vi.fn(),
  setErrorMessage: vi.fn(),
};

describe("Upload", () => {
  const testIdSuffix = "upload";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with initial props", () => {
    render(<Upload {...defaultProps} />);
    expect(screen.getByTestId(`${defaultProps.dataTestId}-${testIdSuffix}`)).toBeInTheDocument();
    expect(screen.queryByText("Uploading...")).not.toBeInTheDocument();
  });

  it("uploads files correctly", async () => {
    render(<Upload {...defaultProps} />);

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
    render(<Upload {...defaultProps} />);

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
});
