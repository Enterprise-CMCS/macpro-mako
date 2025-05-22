import ReactGA from "react-ga4";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendGAEvent } from "./sendGAEvent";

const reactSpy = vi.spyOn(ReactGA, "event").mockImplementation(vi.fn());

describe("sendGAEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle userState events", () => {
    sendGAEvent("event", "user", "state");
    expect(reactSpy).toHaveBeenCalledWith({
      action: "event",
      category: "state",
      user_role: "user",
    });
  });

  it("should handle events without userState", () => {
    sendGAEvent("event", "user", null);
    expect(reactSpy).toHaveBeenCalledWith({
      action: "event",
      user_role: "user",
    });
  });
});
