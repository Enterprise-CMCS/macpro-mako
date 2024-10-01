import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { Action, Attachment, Authority } from "shared-types";
import { getPackageChangelog } from "../api/package";
import {
  formatAttachments,
  formatDate,
  formatNinetyDaysDate,
  getEmailTemplates,
  getLatestMatchingEvent,
  emailTemplates,
} from "."; // Adjust the import to the correct module path

vi.mock("../api/package", () => ({
  getPackageChangelog: vi.fn(),
}));

describe("formatAttachments", () => {
  it("should return 'no attachments' when attachmentList is null or empty", () => {
    expect(formatAttachments("text", null)).toBe("no attachments");
    expect(formatAttachments("text", [])).toBe("no attachments");
  });

  it("should format attachments as text", () => {
    const attachments: Attachment[] = [
      {
        title: "title1",
        filename: "file1.txt",
        bucket: "bucket1",
        key: "key1",
        uploadDate: 1628090400000,
      },
      {
        title: "title2",
        filename: "file2.txt",
        bucket: "bucket2",
        key: "key2",
        uploadDate: 1628186800000,
      },
    ];
    const result = formatAttachments("text", attachments);
    expect(result).toBe("\n\ntitle1: file1.txt\ntitle2: file2.txt\n\n");
  });

  it("should format attachments as HTML", () => {
    const attachments: Attachment[] = [
      {
        title: "title1",
        filename: "file1.txt",
        bucket: "bucket1",
        key: "key1",
        uploadDate: 1628090400000,
      },
      {
        title: "title2",
        filename: "file2.txt",
        bucket: "bucket2",
        key: "key2",
        uploadDate: 1628186800000,
      },
    ];
    const result = formatAttachments("html", attachments);
    expect(result).toBe(
      "<ul><li>title1: file1.txt</li><li>title2: file2.txt</li></ul>",
    );
  });
});

describe("formatDate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 'Pending' if date is null or undefined", () => {
    expect(formatDate(null)).toBe("Pending");
    expect(formatDate(undefined)).toBe("Pending");
  });

  it("should format date correctly", () => {
    const result = formatDate(1628090400000);
    expect(result).toBe("August 4, 2021");
  });
});

describe("formatNinetyDaysDate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 'Pending' if date is null or undefined", () => {
    expect(formatNinetyDaysDate(null)).toBe("Pending");
    expect(formatNinetyDaysDate(undefined)).toBe("Pending");
  });

  it("should format ninety days date correctly", () => {
    const result = formatNinetyDaysDate(1628090400000);
    expect(result).toBe("November 2, 2021 @ 11:59pm ET");
  });
});

describe("getEmailTemplates", () => {
  it("should throw an error if no templates are found for the action", async () => {
    await expect(
      getEmailTemplates("unknown-action" as Action, "cms" as Authority),
    ).rejects.toThrow("No templates found for action unknown-action");
  });

  it("should return the correct templates for a given action and authority", async () => {
    const templates = await getEmailTemplates(
      Action.WITHDRAW_PACKAGE,
      "medicaid spa" as Authority,
    );

    // Use optional chaining and type assertion to ensure correct type access
    const emailTemplateKey = emailTemplates[Action.WITHDRAW_PACKAGE] as {
      [key: string]: any;
    };
    expect(templates).toEqual(
      Object.values(emailTemplateKey?.["medicaid spa"] || {}),
    );
  });
});

describe("getLatestMatchingEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the latest matching event", async () => {
    const mockHits = {
      hits: [
        { _source: { actionType: "action1", timestamp: 1628090400000 } },
        { _source: { actionType: "action1", timestamp: 1628186800000 } },
      ],
    };
    (getPackageChangelog as Mock).mockResolvedValue({ hits: mockHits });

    const result = await getLatestMatchingEvent("test-id", "action1");
    expect(result).toEqual({ actionType: "action1", timestamp: 1628186800000 });
  });
});
