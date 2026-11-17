import { describe, expect, it } from "vitest";

import { DRAFTABLE_EVENTS } from "./draft-events";

describe("draftable events", () => {
  it("includes CEntra record submission", () => {
    expect(DRAFTABLE_EVENTS).toContain("ce-record-submitted");
    expect(DRAFTABLE_EVENTS).not.toContain("ce-subsequent-documents");
  });
});
