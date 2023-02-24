import { replaceStringValues } from "../templatizeCloudWatchDashboard";
import { it, describe, expect } from "vitest";

describe("replaceStringValues", () => {
  it("replaces string with correct values", () => {
    const string = "hello jim";
    const replacables = { hello: "world", jim: "wally" };
    const response = replaceStringValues(string, replacables);
    expect(response).toBe("world wally");
  });
});
