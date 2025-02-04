import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { checkEnvVars } from "./env";

describe("env", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("checkEnvVars", () => {
    it("should not throw error when all required vars are present", () => {
      process.env.TEST_VAR1 = "value1";
      process.env.TEST_VAR2 = "value2";

      expect(() => checkEnvVars(["TEST_VAR1", "TEST_VAR2"])).not.toThrow();
    });

    it("should throw error when required vars are missing", () => {
      process.env.TEST_VAR1 = "value1";
      // TEST_VAR2 is missing

      expect(() => checkEnvVars(["TEST_VAR1", "TEST_VAR2"])).toThrow(
        "Missing required environment variables: TEST_VAR2",
      );
    });

    it("should throw error with all missing vars in message", () => {
      // Both vars are missing
      expect(() => checkEnvVars(["TEST_VAR1", "TEST_VAR2"])).toThrow(
        "Missing required environment variables: TEST_VAR1, TEST_VAR2",
      );
    });

    it("should handle empty array of required vars", () => {
      expect(() => checkEnvVars([])).not.toThrow();
    });
  });
});
