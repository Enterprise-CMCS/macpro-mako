import { render, screen } from "@testing-library/react";
import { describe, vi, test, expect } from "vitest";
import { Profile } from ".";

vi.mock("@/api", async (importOriginals) => ({
  ...((await importOriginals()) as object),
  useGetUser: vi.fn(() => ({
    data: {
      user: {
        "custom:state": "MD,OH,NY",
        "custom:cms-roles": "onemac-micro-statesubmitter,onemac-micro-readonly",
        given_name: "George",
        family_name: "Harrison",
        email: "george@example.com",
      },
    },
  })),
}));

describe("Profile", () => {
  test("renders state names", () => {
    render(<Profile />);

    const states = screen.getByText("Maryland, Ohio, New York");

    expect(states).toBeInTheDocument();
  });

  test("renders roles", () => {
    render(<Profile />);

    const states = screen.getByText("State Submitter, Read Only");

    expect(states).toBeInTheDocument();
  });

  test("renders full name", () => {
    render(<Profile />);

    const states = screen.getByText("George Harrison");

    expect(states).toBeInTheDocument();
  });

  test("renders email", () => {
    render(<Profile />);

    const states = screen.getByText("george@example.com");

    expect(states).toBeInTheDocument();
  });
});
