import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { zSpaIdSchema, zAttachmentOptional, zAttachmentRequired } from "./zod";
import { isAuthorizedState } from "@/utils";
import { itemExists } from "@/api";

// Mock async functions
vi.mock("@/utils", () => ({
  isAuthorizedState: vi.fn(),
  itemExists: vi.fn(),
}));

// Setup for mock return values
beforeEach(() => {
  vi.mocked(isAuthorizedState).mockResolvedValue(true);
  vi.mocked(itemExists).mockResolvedValue(false);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("zSpaIdSchema", () => {
  it("validates a correct ID format", async () => {
    const result = await zSpaIdSchema.safeParseAsync("MD-21-1234");
    expect(result.success).toBe(true);
  });

  it("validates a corred ID format with a suffix", async () => {
    const result = await zSpaIdSchema.safeParseAsync("MD-21-1234-ABCD");
    expect(result.success).toBe(true);
  });

  it("fails when the ID is empty", async () => {
    const result = await zSpaIdSchema.safeParseAsync("");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe("Required");
  });

  it("fails when state is unauthorized", async () => {
    vi.mocked(isAuthorizedState).mockResolvedValue(false);
    const result = await zSpaIdSchema.safeParseAsync("MD-21-1234");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    );
  });

  it("fails when ID already exists", async () => {
    vi.mocked(itemExists).mockResolvedValue(true);
    const result = await zSpaIdSchema.safeParseAsync("MD-21-1234");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again.",
    );
  });
});

describe("zAttachemtnRequired", () => {
  const schema = zAttachmentRequired({ min: 1, max: 3 });

  it("validates an array within file count bounds", () => {
    const files = [
      new File(["content"], "file1.txt"),
      new File(["content"], "file2.txt"),
    ];
    const result = schema.safeParse(files);
    expect(result.success).toBe(true);
  });

  it("fails if file count is below minimum", () => {
    const result = schema.safeParse([]);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe("Required");
  });

  it("fails if file count is above maximum", () => {
    const files = [
      new File(["content"], "file1.txt"),
      new File(["content"], "file2.txt"),
      new File(["content"], "file3.txt"),
      new File(["content"], "file4.txt"),
    ];
    const result = schema.safeParse(files);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe("Required");
  });
});

describe("zAttachmentOptional", () => {
  it("validates an empty array", async () => {
    const result = await zAttachmentOptional.safeParseAsync([]);
    expect(result.success).toBe(true);
  });

  it("validates an array of files", async () => {
    const result = await zAttachmentOptional.safeParseAsync([
      new File(["content"], "file.txt"),
    ]);
    expect(result.success).toBe(true);
  });

  it("passes when no files are provided", () => {
    const result = zAttachmentOptional.safeParse(undefined);
    expect(result.success).toBe(true);
  });
});
