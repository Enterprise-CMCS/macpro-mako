import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { DateTime } from "luxon";
import { Action, Authority } from "shared-types";
import { getPackageChangelog } from "../api/package";
import {
  formatDate,
  formatNinetyDaysDate,
  getEmailTemplates,
  getLatestMatchingEvent,
  emailTemplates,
} from ".";

vi.mock("luxon", () => {
  const originalLuxon = vi.importActual("luxon");
  return {
    ...originalLuxon,
    DateTime: {
      fromMillis: vi.fn(),
    },
  };
});

vi.mock("../api/package", () => ({
  getPackageChangelog: vi.fn(),
}));

describe("formatDate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 'Pending' if date is null or undefined", () => {
    expect(formatDate(null)).toBe("Pending");
    expect(formatDate(undefined)).toBe("Pending");
  });

  it("should format date correctly", () => {
    const mockDate = {
      toFormat: vi.fn().mockReturnValue("August 4, 2021"),
    };
    (DateTime.fromMillis as Mock).mockReturnValue(mockDate);
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
    const mockDate = {
      plus: vi.fn().mockReturnThis(),
      toFormat: vi.fn().mockReturnValue("November 2, 2021 @ 11:59pm ET"),
    };
    (DateTime.fromMillis as Mock).mockReturnValue(mockDate);
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
