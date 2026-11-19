import { Authority } from "shared-types/authority";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getFormOrigin } from "./formOrigin";

vi.mock("./crumbs", () => ({
  getDashboardTabForAuthority: vi.fn(() => "spas"), // Mock return value
}));

describe("getFormOrigin", () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;

    const mockLocation = {
      ...originalLocation,
      search: "",
      assign: vi.fn(),
      reload: vi.fn(),
      replace: vi.fn(),
    };

    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
    vi.clearAllMocks(); // Clear mocks after each test
  });

  it("should return the correct pathname and search for dashboard origin", () => {
    window.location.search = `?origin=dashboard`;

    const authority = "chip spa" as Authority; // Use string assertion

    const result = getFormOrigin({ authority });

    expect(result).toEqual({
      pathname: `/dashboard`,
      search: new URLSearchParams({ tab: "spas" }).toString(),
    });
    // Other tests remain unchanged
  });
  it("should return the correct pathname for spa submission origin", () => {
    window.location.search = `?origin=spas`;

    const result = getFormOrigin();

    expect(result).toEqual({
      pathname: `/dashboard`,
      search: new URLSearchParams({ tab: "spas" }).toString(),
    });
  });

  it("should return the correct pathname for waiver submission origin", () => {
    window.location.search = `?origin=waivers`;

    const result = getFormOrigin();

    expect(result).toEqual({
      pathname: `/dashboard`,
      search: new URLSearchParams({ tab: "waivers" }).toString(),
    });
  });

  it("should return the default pathname for unknown origin", () => {
    window.location.search = "";

    const result = getFormOrigin();

    expect(result).toEqual({
      pathname: `/dashboard`,
    });
  });

  it("falls back to dashboard when details origin is missing id or authority", () => {
    window.location.search = `?origin=details`;

    expect(getFormOrigin()).toEqual({
      pathname: `/dashboard`,
    });

    expect(getFormOrigin({ authority: "Medicaid SPA" as Authority })).toEqual({
      pathname: `/dashboard`,
      search: new URLSearchParams({ tab: "spas" }).toString(),
    });
  });

  it("falls back to dashboard for unrecognized origin values", () => {
    window.location.search = `?origin=not-a-real-route`;

    expect(getFormOrigin()).toEqual({
      pathname: `/dashboard`,
    });
  });
});
