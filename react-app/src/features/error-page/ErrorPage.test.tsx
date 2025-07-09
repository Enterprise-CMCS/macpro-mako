import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import * as ReactGA from "@/utils/ReactGA/SendGAEvent";

import { ErrorPage } from "./index";
const sendGAEventSpy = vi.spyOn(ReactGA, "sendGAEvent");
// Mock feature flag hook
vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: vi.fn(),
}));
const mockedUseFeatureFlag = useFeatureFlag as ReturnType<typeof vi.fn>;
describe("ErrorPage", () => {
  it("should send a GA event on mount", () => {
    mockedUseFeatureFlag.mockReturnValue(false);

    render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>,
    );

    expect(sendGAEventSpy).toHaveBeenCalledWith("error_404", { message: "404 page not found" });
  });

  it("should use /faq if TOGGLE_FAQ is disabled", () => {
    mockedUseFeatureFlag.mockReturnValue(false);
    render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /Sorry, we couldn't find that page./ }),
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Go to Home Page" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Get Support" })).toHaveAttribute("href", "/faq");
  });

  it("should use /support link when the TOGGLE_FAQ flag is enabled", () => {
    mockedUseFeatureFlag.mockReturnValue(true);

    render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Get Support" })).toHaveAttribute("href", "/support");
  });
});
