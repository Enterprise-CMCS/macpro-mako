import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { RoleStatusCardNew } from "./RoleStatusCardNew";

describe("RoleStatusCardNew", () => {
  it("does not render dropdown if isState is true", () => {
    render(
      <RoleStatusCardNew
        role="cmsroleapprover"
        access={{
          territory: "N/A",
          role: "cmsroleapprover",
          status: "active",
        }}
      />,
    );
    expect(screen.queryByText("self-revoke")).toBeNull();
  });

  it("does not render dropdown if isState is true", () => {
    render(
      <RoleStatusCardNew
        role="statesubmitter"
        access={{
          territory: "CA",
          role: "statesubmitter",
          status: "active",
        }}
      />,
    );
    expect(screen.queryByText("self-revoke")).toBeNull();
  });

  it("renders dropdown trigger when conditions are met", () => {
    render(
      <RoleStatusCardNew
        role="defaultcmsuser"
        access={{
          territory: "N/A",
          role: "cmsroleapprover",
          status: "pending",
        }}
      />,
    );
    expect(screen.getByTestId("self-revoke")).toBeInTheDocument();
  });

  it("shows 'Cancel Request' on dropdown open", async () => {
    const user = userEvent.setup();
    render(
      <RoleStatusCardNew
        role="defaultcmsuser"
        access={{
          territory: "N/A",
          role: "cmsroleapprover",
          status: "pending",
        }}
      />,
    );
    const button = screen.getByTestId("self-revoke");
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(await screen.findByText("Cancel Request")).toBeInTheDocument();
  });
});
