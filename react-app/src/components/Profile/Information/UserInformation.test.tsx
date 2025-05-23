import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UserInformation } from "./index";

describe("UserInformation", () => {
  it("should display the user information", () => {
    render(
      <UserInformation fullName="Test User" role="State Submitter" email="test@example.com" />,
    );
    expect(screen.getByRole("heading", { name: "Full Name", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Role", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("State Submitter")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Email" })).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});
