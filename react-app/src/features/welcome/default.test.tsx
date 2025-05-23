import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import * as hooks from "@/hooks/useHideBanner";
import { renderWithMemoryRouter } from "@/utils/test-helpers";

import { Welcome } from "./default";

const hookSpy = vi.spyOn(hooks, "useHideBanner");

describe("Default Welcome", () => {
  const setup = () =>
    renderWithMemoryRouter(
      <Welcome />,
      [
        {
          path: "/",
          element: <Welcome />,
        },
      ],
      {
        initialEntries: ["/"],
      },
    );

  it("renders the page with banner hidden", () => {
    hookSpy.mockReturnValueOnce(true);
    setup();

    expect(screen.getByText(/Welcome to the official submission system/)).toBeInTheDocument();
    screen.debug(screen.getByRole("heading", { name: "New and Notable", level: 2 }).parentElement);
    expect(
      screen.getByRole("heading", { name: "New and Notable", level: 2 }).parentElement,
    ).toHaveClass("hidden");
  });

  it("renders the page without banner hidden", () => {
    hookSpy.mockRejectedValueOnce(false);

    setup();

    expect(screen.getByText(/Welcome to the official submission system/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "New and Notable", level: 2 }).parentElement.hidden,
    ).toBeFalsy();
  });
});
