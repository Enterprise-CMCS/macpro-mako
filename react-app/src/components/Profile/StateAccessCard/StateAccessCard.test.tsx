import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StateAccessCard } from "./index";

describe("StateAccessCard", () => {
  it("should handle an undefined access", () => {
    // @ts-ignore
    render(<StateAccessCard />);
    expect(screen.queryByText("State System Admin: ")).toBeNull();
  });

  it("should display pending access", () => {
    render(
      <StateAccessCard
        role="statesubmitter"
        access={{
          territory: "MD",
          role: "statesubmitter",
          status: "pending",
          doneByEmail: "test@example.com",
          doneByName: "Test Admin",
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Maryland", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("Pending Access")).toBeInTheDocument();
  });
});
