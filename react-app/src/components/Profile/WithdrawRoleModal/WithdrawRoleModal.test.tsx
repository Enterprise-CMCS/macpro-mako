import { render, screen } from "@testing-library/react";
import React from "react";

import { SelfRevokeAcess } from "@/features";

import { WithdrawRoleModal } from "./index";

const BaseRoleAccess: Partial<SelfRevokeAcess> = {
  id: "1",
  eventType: "user-role",
  email: "",
  doneByEmail: "",
  doneByName: "",
};

const defaultProps = {
  open: true,
  onAccept: jest.fn(),
  onCancel: jest.fn(),
};

describe("WithdrawRoleModal", () => {
  it("should render nothing when selfRevokeRole is null", () => {
    const { container } = render(<WithdrawRoleModal {...defaultProps} selfRevokeRole={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render 'Withdraw State Access?' when isNewUserRoleDisplay is false", () => {
    render(
      <WithdrawRoleModal
        {...defaultProps}
        selfRevokeRole={
          {
            ...BaseRoleAccess,
            isNewUserRoleDisplay: false,
            role: "statesubmitter",
            territory: "CA",
            status: "active",
          } as SelfRevokeAcess
        }
      />,
    );
    expect(screen.getByText("Withdraw State Access?")).toBeInTheDocument();
    expect(screen.getByText(/California State System Admin will be notified/)).toBeInTheDocument();
  });

  it("should render 'Withdraw Role Request?' when status is pending", () => {
    render(
      <WithdrawRoleModal
        {...defaultProps}
        selfRevokeRole={
          {
            ...BaseRoleAccess,
            isNewUserRoleDisplay: true,
            role: "statesubmitter",
            territory: "CA",
            status: "pending",
          } as SelfRevokeAcess
        }
      />,
    );
    expect(screen.getByText("Withdraw Role Request?")).toBeInTheDocument();
    expect(screen.getByText(/pending approval/)).toBeInTheDocument();
  });

  it("should render 'Withdraw California State Submitter Access?' when status is active", () => {
    render(
      <WithdrawRoleModal
        {...defaultProps}
        selfRevokeRole={
          {
            ...BaseRoleAccess,
            isNewUserRoleDisplay: true,
            role: "statesubmitter",
            territory: "CA",
            status: "active",
          } as SelfRevokeAcess
        }
      />,
    );
    expect(screen.getByText("Withdraw California State Submitter Access?")).toBeInTheDocument();
    expect(screen.getByText(/The California State Admin will be notified/)).toBeInTheDocument();
  });
});
