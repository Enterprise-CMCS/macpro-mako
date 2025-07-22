import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { RoleStatusCardNew } from "./RoleStatusCardNew";

describe("RoleStatusCardNew", () => {
  it("does not render dropdown if status is active and role is defaultcmsuser", () => {
    render(
      <RoleStatusCardNew
        role="defaultcmsuser"
        access={{
          territory: "N/A",
          role: "defaultcmsuser",
          status: "active",
        }}
      />,
    );
    expect(screen.queryByTestId("self-revoke")).toBeNull();
  });

  it("renders dropdown trigger when status is pending", () => {
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

  it("renders dropdown trigger when status is active and role is not defaultcmsuser", () => {
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
    expect(screen.getByTestId("self-revoke")).toBeInTheDocument();
  });

  it("shows 'Cancel Request' in dropdown when status is pending", async () => {
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
    await user.click(screen.getByTestId("self-revoke"));
    expect(await screen.findByText("Cancel Request")).toBeInTheDocument();
  });

  it("shows 'Remove User Role' in dropdown when status is active", async () => {
    const user = userEvent.setup();
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
    await user.click(screen.getByTestId("self-revoke"));
    expect(await screen.findByText("Remove User Role")).toBeInTheDocument();
  });

  it("shows system admin approvers as 'Pre-assigned'", () => {
    render(
      <RoleStatusCardNew
        role="systemadmin"
        access={{
          territory: "N/A",
          role: "systemadmin",
          status: "active",
        }}
      />,
    );
    expect(screen.getByText("Approvers")).toBeInTheDocument();
    expect(screen.getByText("Pre-assigned")).toBeInTheDocument();
  });

  it("shows CMS roles as auto-approved", () => {
    render(
      <RoleStatusCardNew
        role="defaultcmsuser"
        access={{
          territory: "N/A",
          role: "defaultcmsuser",
          status: "active",
        }}
      />,
    );
    expect(screen.getByText("Approvers")).toBeInTheDocument();
    expect(screen.getByText(/Automatically approved/i)).toBeInTheDocument();
  });

  it("shows ApproverInfo for other roles when status is pending", () => {
    render(
      <RoleStatusCardNew
        role="statesubmitter"
        access={{
          territory: "CA",
          role: "statesubmitter",
          status: "pending",
        }}
      />,
    );
    expect(screen.getByText("Approvers")).toBeInTheDocument();
  });

  it("hides Approvers header if status is not pending and role is norole", () => {
    render(
      <RoleStatusCardNew
        role="norole"
        access={{
          territory: "CA",
          role: "statesubmitter",
          status: "active",
        }}
      />,
    );
    expect(screen.queryByText("Approvers")).not.toBeInTheDocument();
  });
});
