import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import {
  areAllAttachmentsEmpty,
  DetailsHeading,
  EMAIL_CONFIG,
  getCpocEmail,
  Textarea,
} from "../email-components";

// 🟢 Test EMAIL_CONFIG
test("EMAIL_CONFIG contains correct email addresses", () => {
  expect(EMAIL_CONFIG.DEV_EMAIL).toBe("mako.stateuser+dev-to@gmail.com");
  expect(EMAIL_CONFIG.CHIP_EMAIL).toBe("CHIPSPASubmissionMailBox@cms.hhs.gov");
  expect(EMAIL_CONFIG.SPA_EMAIL).toBe("spa@cms.hhs.gov");
  expect(EMAIL_CONFIG.SPAM_EMAIL).toBe("SPAM@cms.hhs.gov");
});

// 🟢 Test areAllAttachmentsEmpty
test("areAllAttachmentsEmpty returns true for empty attachments", () => {
  expect(areAllAttachmentsEmpty({})).toBe(true);
  expect(areAllAttachmentsEmpty({ title1: undefined })).toBe(true); //
  expect(areAllAttachmentsEmpty({ title2: { label: "Test", files: [] } })).toBe(true);
});

test("areAllAttachmentsEmpty returns false when at least one attachment contains files", () => {
  expect(
    areAllAttachmentsEmpty({
      title1: {
        label: "Test",
        files: [
          {
            key: "12345",
            filename: "file1.pdf",
            title: "Document Title",
            bucket: "my-bucket",
            uploadDate: 1700000000,
          },
        ],
      },
    }),
  ).toBe(false);
});

// 🟢 Test Textarea Component
test("renders Textarea component with children", () => {
  render(<Textarea>This is a test</Textarea>);
  expect(screen.getByText("This is a test")).toBeTruthy();
});

// 🟢 Test DetailsHeading Component
test("renders DetailsHeading with correct text", () => {
  render(<DetailsHeading />);
  expect(screen.getByText("Details:")).toBeTruthy();
});

// 🟢 Test getCpocEmail
test("returns an empty array and logs error when an exception occurs in getCpocEmail", () => {
  const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {});

  const result = getCpocEmail(undefined);

  expect(result).toEqual([]);
  expect(console.error).toHaveBeenCalled();

  consoleErrorMock.mockRestore();
});
