import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import {
  areAllAttachmentsEmpty,
  Attachments,
  DetailsHeading,
  EMAIL_CONFIG,
  getCpocEmail,
  Textarea,
} from "./email-components";

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

test("Attachments keeps long labels and filenames wrapped in their columns", () => {
  const longLabel =
    "Cover IG_Consolidated_STATES_MSP_Eligibility_Income_Resource_Methodologies_Final_20170714_v.1.0-Letter";
  const longFilename =
    "screencapture-d1utf3cdgyn07c-cloudfront-net-actions-temporary-extension-1915-b-MD-20230-2026-06-04-13-28-48.pdf";

  const { container } = render(
    <Attachments
      attachments={{
        longAttachment: {
          label: longLabel,
          files: [
            {
              key: "long-attachment-key.pdf",
              filename: longFilename,
              title: "Long Attachment",
              bucket: "mako-outbox-attachments-635052997545",
              uploadDate: 1700000000,
            },
          ],
        },
      }}
    />,
  );

  const attachmentsTable = container.querySelector('table[style*="table-layout: fixed"]');
  const labelCell = screen.getByText(`${longLabel}:`).closest("td");
  const filenameCell = screen.getByText(longFilename).closest("td");

  expect(attachmentsTable).toBeTruthy();
  expect(labelCell?.style.wordBreak).toBe("break-word");
  expect(labelCell?.style.overflowWrap).toBe("anywhere");
  expect(filenameCell?.style.wordBreak).toBe("break-word");
  expect(filenameCell?.style.overflowWrap).toBe("anywhere");
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
