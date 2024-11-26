import { describe, it, expect, vi } from "vitest";
import { handler } from "./sinkMain";

describe("handler", () => {
  it("handles a kafka event successfully", () => {
    handler({ placeholder: true }, expect.any, vi.fn());
  });
});
