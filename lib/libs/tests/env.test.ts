import { checkEnvVars } from "..";
import { test, describe, expect, afterEach } from "vitest";
describe("checkEnvVars", () => {
  afterEach(() => {
    delete process.env.FOO;
    delete process.env.BAZ;
  });
  test("should not throw an error when all required environment variables are present", () => {
    process.env.FOO = "bar";
    process.env.BAZ = "qux";
    expect(() => checkEnvVars(["FOO", "BAZ"])).not.toThrow();
  });
  test("should throw an error when a required environment variable is missing", () => {
    process.env.FOO = "bar";
    expect(() => checkEnvVars(["FOO", "BAZ"])).toThrowError(
      "Missing required environment variables: BAZ"
    );
  });
  test("should throw an error when multiple required environment variables are missing", () => {
    expect(() => checkEnvVars(["FOO", "BAZ"])).toThrowError(
      "Missing required environment variables: FOO, BAZ"
    );
  });
});
