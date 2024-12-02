import { events } from "shared-types/events";
import { describe, expect, it } from "vitest";

describe("Contracting Renewal", () => {
  it("should validate successfully with a valid id", () => {
    const validId = "MD-2024.R01.00";
    const schema = events["contracting-renewal"].baseSchema.pick({ id: true });
    const result = schema.safeParse({ id: validId });

    expect(result.success).toBe(true);
  });

  it("should fail with empty ID", () => {
    const validId = "";
    const schema = events["contracting-renewal"].baseSchema.pick({ id: true });
    const result = schema.safeParse({ id: validId });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Required");
  });

  it("should fail with invalid ID format (too short)", () => {
    const invalidId = "MD-202.R01.00";
    const schema = events["contracting-renewal"].baseSchema.pick({ id: true });
    const result = schema.safeParse({ id: invalidId });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/Renewal Number must be in the format of/);
  });

  it("should fail with invalid ID format (too long)", () => {
    const invalidId = "MD-123456.R01.00";
    const schema = events["contracting-renewal"].baseSchema.pick({ id: true });
    const result = schema.safeParse({ id: invalidId });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/Renewal Number must be in the format of/);
  });

  it("should fail with invalid ID format (invalid characters)", () => {
    const invalidId = "MD-1234.R0a.00";
    const schema = events["contracting-renewal"].baseSchema.pick({ id: true });
    const result = schema.safeParse({ id: invalidId });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/Renewal Number must be in the format of/);
  });

  it("should fail with invalid ID format (invalid R##)", () => {
    const invalidId = "NY-1234.R00.00";
    const schema = events["contracting-renewal"].baseSchema.pick({ id: true });
    const result = schema.safeParse({ id: invalidId });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/Renewal Number must be in the format of/);
  });

  it("should fail with invalid ID format (amendment number incremented)", () => {
    const invalidId = "NY-1234.R01.01";
    const schema = events["contracting-renewal"].baseSchema.pick({ id: true });
    const result = schema.safeParse({ id: invalidId });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/Renewal Number must be in the format of/);
  });
});
