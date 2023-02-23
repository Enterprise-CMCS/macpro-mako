import { it, describe, expect, vi } from "vitest";

describe("example test", () => {
  it("function returns proper value", () => {
    const workflowFunction = vi.fn(() => ({
      status: 200,
      request: "success",
    }));

    workflowFunction();

    expect(workflowFunction).toReturnWith({
      status: 200,
      request: "success",
    });
  });
});