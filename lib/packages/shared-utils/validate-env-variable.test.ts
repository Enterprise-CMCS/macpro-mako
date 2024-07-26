import { describe, it, expect, beforeEach } from "vitest";
import { validateEnvVariable } from ".";

describe("validateEnvVariable", () => {
  beforeEach(() => {
    delete process.env.TEST_VARIABLE;
  });

  it("should return the value of the environment variable if it is set", () => {
    process.env.TEST_VARIABLE = "test-value";
    const result = validateEnvVariable("TEST_VARIABLE");
    expect(result).toBe("test-value");
  });

  it("should throw an error if the environment variable is not set", () => {
    expect(() => validateEnvVariable("TEST_VARIABLE")).toThrow(
      "ERROR: Environment variable TEST_VARIABLE must be set and be a non-empty string.",
    );
  });

  it("should throw an error if the environment variable is an empty string", () => {
    process.env.TEST_VARIABLE = "";
    expect(() => validateEnvVariable("TEST_VARIABLE")).toThrow(
      "ERROR: Environment variable TEST_VARIABLE must be set and be a non-empty string.",
    );
  });

  it("should throw an error if the environment variable is only whitespace", () => {
    process.env.TEST_VARIABLE = "   ";
    expect(() => validateEnvVariable("TEST_VARIABLE")).toThrow(
      "ERROR: Environment variable TEST_VARIABLE must be set and be a non-empty string.",
    );
  });
});
