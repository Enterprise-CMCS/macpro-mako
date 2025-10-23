import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PathTracker } from "./PathTracker";
import * as ReactGA from "./SendGAEvent";

// Mock sendGAEvent
const sendGAEventMock = vi.spyOn(ReactGA, "sendGAEvent");

let originalPushState: History["pushState"];
let originalReplaceState: History["replaceState"];

describe("PathTracker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sendGAEventMock.mockClear();

    originalPushState = window.history.pushState;
    originalReplaceState = window.history.replaceState;
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
  });

  it("sends a page_view event on initial mount", () => {
    render(
      <PathTracker userRole="cmsroleapprover">
        <div>Test Page</div>
      </PathTracker>,
    );
    expect(sendGAEventMock).toHaveBeenCalledWith("page_view", {
      page_path: window.location.pathname,
      referrer: window.location.pathname,
      user_role: "cmsroleapprover",
    });
  });

  it("tracks route changes via pushState", () => {
    render(
      <PathTracker userRole="statesubmitter">
        <div>Test Page</div>
      </PathTracker>,
    );

    vi.advanceTimersByTime(3000);

    // Trigger route change
    window.history.pushState({}, "", "/new-path");

    // 1st call: initial page view
    expect(sendGAEventMock).toHaveBeenNthCalledWith(
      1,
      "page_view",
      expect.objectContaining({
        page_path: "/",
        referrer: "/",
        user_role: "statesubmitter",
      }),
    );

    // 2nd call: page_duration for "/"
    expect(sendGAEventMock).toHaveBeenNthCalledWith(
      2,
      "page_duration",
      expect.objectContaining({
        page_path: "/",
        time_on_page_sec: 3,
        user_role: "statesubmitter",
      }),
    );

    // 3rd call: page_view for "/new-path"
    expect(sendGAEventMock).toHaveBeenNthCalledWith(
      3,
      "page_view",
      expect.objectContaining({
        page_path: "/new-path",
        referrer: "/",
        user_role: "statesubmitter",
      }),
    );
  });

  it("tracks route changes via replaceState", () => {
    render(
      <PathTracker userRole="cmsreviewer">
        <div>Test Page</div>
      </PathTracker>,
    );

    vi.advanceTimersByTime(5000);

    const anotherPath = "/another-path";
    window.history.replaceState({}, "", anotherPath);

    expect(sendGAEventMock).toHaveBeenNthCalledWith(
      1,
      "page_view",
      expect.objectContaining({
        page_path: "/new-path",
        referrer: "/new-path",
        user_role: "cmsreviewer",
      }),
    );

    expect(sendGAEventMock).toHaveBeenNthCalledWith(
      2,
      "page_duration",
      expect.objectContaining({
        page_path: "/new-path",
        time_on_page_sec: 5,
        user_role: "cmsreviewer",
      }),
    );

    expect(sendGAEventMock).toHaveBeenNthCalledWith(
      3,
      "page_view",
      expect.objectContaining({
        page_path: "/another-path",
        referrer: "/new-path",
        user_role: "cmsreviewer",
      }),
    );
  });

  it("sends page_duration on unmount", () => {
    const { unmount } = render(
      <PathTracker userRole="systemadmin">
        <div>Test Page</div>
      </PathTracker>,
    );
    vi.advanceTimersByTime(4000);

    unmount();

    expect(sendGAEventMock).toHaveBeenCalledWith(
      "page_duration",
      expect.objectContaining({
        page_path: window.location.pathname,
        user_role: "systemadmin",
        time_on_page_sec: 4,
      }),
    );
  });

  it("ignores route change if pathname does not change", () => {
    render(
      <PathTracker userRole="helpdesk">
        <div>Test Page</div>
      </PathTracker>,
    );

    // Manually trigger onRouteChange with no path change
    const samePath = window.location.pathname;
    window.history.pushState({}, "", samePath);

    // Should not call sendGAEvent again (only the initial page view)
    expect(sendGAEventMock).toHaveBeenCalledTimes(1);
  });
});
