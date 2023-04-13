import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import MainWrapper from ".";
describe("Header test", () => {
  test("should show main wrapper text", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <MainWrapper />,
          children: [{ path: "test", element: <h3>testing</h3> }],
        },
      ],
      {
        initialEntries: ["/", "/test"],
        initialIndex: 1,
      }
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByText(/test/i)).toBeDefined();
  });
});
