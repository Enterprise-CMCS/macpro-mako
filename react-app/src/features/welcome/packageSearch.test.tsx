import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import * as ReactGA from "@/utils/ReactGA/SendGAEvent";
import { PackageSearch } from "./packageSearch";

describe("PackageSearch", () => {
  let sendGAEventSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    sendGAEventSpy = vi.spyOn(ReactGA, "sendGAEvent");
  });

  it("renders search input and button", () => {
    render(
        <MemoryRouter>
          <PackageSearch />
        </MemoryRouter>
      );
      
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("updates search text and calls GA on radio button change", () => {
    render(
        <MemoryRouter>
          <PackageSearch />
        </MemoryRouter>
      );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test search" } });
    expect(screen.getByRole("textbox")).toHaveValue("test search");

    fireEvent.click(screen.getByLabelText("Search waivers"));
    expect(sendGAEventSpy).toHaveBeenCalledWith("home_search_radio", { option: "waivers" });
  });

  it("navigates to dashboard and fires GA event on search", () => {
    render(
        <MemoryRouter>
          <PackageSearch />
        </MemoryRouter>
      );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "SPA 1234" } });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(sendGAEventSpy).toHaveBeenCalledWith("home_search_text", null);
  });
});
