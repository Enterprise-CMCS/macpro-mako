import { describe, expect, it } from "vitest";

import { apiStageDataTraceEnabled } from "./api-stage-logging";

describe("apiStageDataTraceEnabled", () => {
  it("enables data tracing for dev stages", () => {
    expect(apiStageDataTraceEnabled(true)).toBe(true);
  });

  it("disables data tracing for shared stages", () => {
    expect(apiStageDataTraceEnabled(false)).toBe(false);
  });
});
