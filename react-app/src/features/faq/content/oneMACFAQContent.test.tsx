import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { slugify, handleSupportLinkClick } from "./oneMACFAQContent";

describe("slugify", () => {
  it("should convert a simple string to a slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("should remove special characters", () => {
    expect(slugify("What's this? & More!")).toBe("what-s-this-more");
  });

  it("should trim hyphens from the start and end", () => {
    expect(slugify("   Hello World! ")).toBe("hello-world");
  });

  it("should truncate long strings", () => {
    const longString = "a".repeat(100);
    expect(slugify(longString).length).toBeLessThanOrEqual(40);
  });
});


describe("handleSupportLinkClick", () => {
  let gtagSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock window.gtag
    gtagSpy = vi.fn();
    (window as any).gtag = gtagSpy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should send a GA event with the correct type and label", () => {
    const event = {
      currentTarget: {
        textContent: "FAQ Question Number 1!",
      },
    } as unknown as React.MouseEvent<HTMLElement>;

    const clickHandler = handleSupportLinkClick("faq");
    clickHandler(event);

    expect(gtagSpy).toHaveBeenCalledWith(
      "event",
      "support_click_faq_faq-question-number-1",
      {
        event_category: "Support",
        event_label: "FAQ Question Number 1!",
      },
    );
  });

  it("should use 'unknown' if textContent is empty", () => {
    const event = {
      currentTarget: {
        textContent: "",
      },
    } as unknown as React.MouseEvent<HTMLElement>;

    const clickHandler = handleSupportLinkClick("faq");
    clickHandler(event);

    expect(gtagSpy).toHaveBeenCalledWith(
      "event",
      "support_click_faq_unknown",
      {
        event_category: "Support",
        event_label: "unknown",
      },
    );
  });
});
