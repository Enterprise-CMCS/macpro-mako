import { events } from "shared-types/events";
import { describe, expect, test } from "vitest";

describe("Capitated Renewal", () => {
  const schema = events["capitated-renewal"].baseSchema.pick({ id: true });
  const formatErrorMessage = "Renewal Number must be in the format of";

  test("VALID ID", () => {
    const validId = "MD-2024.R01.00";
    const result = schema.safeParse({ id: validId });

    expect(result.success).toBe(true);
  });

  test("EMPTY ID", () => {
    const validId = "";
    const result = schema.safeParse({ id: validId });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Required");
  });

  test("TOO SHORT ID FORMAT", () => {
    const invalidId = "MD-202.R01.00";
    const result = schema.safeParse({ id: invalidId });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(formatErrorMessage);
  });

  test("TOO LONG ID FORMAT", () => {
    const invalidId = "MD-123456.R01.00";
    const result = schema.safeParse({ id: invalidId });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(formatErrorMessage);
  });

  test("INVALID CHARACTERS ID FORMAT", () => {
    const invalidId = "MD-1234.R0a.00";
    const result = schema.safeParse({ id: invalidId });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(formatErrorMessage);
  });

  test("INVALID R## ID FORMAT", () => {
    const invalidId = "NY-1234.R00.00";
    const result = schema.safeParse({ id: invalidId });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(formatErrorMessage);
  });

  test("INVALID AMENDMENT ID", () => {
    const invalidId = "NY-1234.R01.01";
    const result = schema.safeParse({ id: invalidId });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(formatErrorMessage);
  });
});
