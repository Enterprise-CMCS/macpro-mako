import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoleStatusCard } from "./index";

let mockUserRoleFeatureFlag = false;

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => {
    if (flag === "SHOW_USER_ROLE_UPDATE") return mockUserRoleFeatureFlag;
    return false;
  },
}));

describe("RoleStatusCard", () => {
  beforeEach(() => {
    mockUserRoleFeatureFlag = false;
  });

  it("should handle an undefined access", () => {
    // @ts-ignore
    render(<RoleStatusCard />);
    expect(screen.queryByText("State System Admin: ")).toBeNull();
  });

  it("should show the correct card heading if the user role feature flag is true for a cmsroleapprover", () => {
    mockUserRoleFeatureFlag = true;
    render(
      <RoleStatusCard
        isNewUserRoleDisplay={mockUserRoleFeatureFlag}
        role="cmsroleapprover"
        access={{
          territory: "N/A",
          role: "cmsroleapprover",
          status: "active",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "CMS Role Approver", level: 3 }),
    ).toBeInTheDocument();
  });

  it("should show the correct card heading if the user role feature flag is true for a statesubmitter", () => {
    mockUserRoleFeatureFlag = true;
    render(
      <RoleStatusCard
        isNewUserRoleDisplay={mockUserRoleFeatureFlag}
        role="statesubmitter"
        access={{
          territory: "CA",
          role: "statesubmitter",
          status: "active",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "State Submitter - CA", level: 3 }),
    ).toBeInTheDocument();
  });

  it("should not show the revoke button if the user is not a state submitter", () => {
    render(
      <RoleStatusCard
        isNewUserRoleDisplay={mockUserRoleFeatureFlag}
        role="cmsroleapprover"
        access={{
          territory: "N/A",
          role: "cmsroleapprover",
          status: "active",
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "N/A", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("Access Granted")).toBeInTheDocument();
    expect(screen.getByText(/CMS System Admin/)).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Self Revoke Access" })).not.toBeInTheDocument();
  });

  it("should display state submitter with pending access and disabled revoke", () => {
    render(
      <RoleStatusCard
        isNewUserRoleDisplay={mockUserRoleFeatureFlag}
        role="statesubmitter"
        access={{
          territory: "MD",
          role: "statesubmitter",
          status: "pending",
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Maryland", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("Pending Access")).toBeInTheDocument();
    expect(screen.getByText(/State System Admin/)).toBeInTheDocument();

    const revokeButton = screen.getByRole("button", { name: "Self Revoke Access" });
    expect(revokeButton).toBeInTheDocument();
    expect(revokeButton).toBeDisabled();
  });

  it("should display state submitter with active access and enabled revoke", async () => {
    const user = userEvent.setup();
    const revokeSpy = vi.fn();
    render(
      <RoleStatusCard
        isNewUserRoleDisplay={mockUserRoleFeatureFlag}
        role="statesubmitter"
        access={{
          territory: "CO",
          role: "statesubmitter",
          status: "active",
        }}
        onClick={revokeSpy}
      />,
    );
    expect(screen.getByRole("heading", { name: "Colorado", level: 3 })).toBeInTheDocument();

    const revokeButton = screen.getByRole("button", { name: "Self Revoke Access" });
    expect(revokeButton).toBeInTheDocument();
    expect(revokeButton).toBeEnabled();

    await user.click(revokeButton);

    expect(revokeSpy).toHaveBeenCalled();
  });

  it("should display a list of approvers", async () => {
    render(
      <RoleStatusCard
        isNewUserRoleDisplay={mockUserRoleFeatureFlag}
        role="statesubmitter"
        access={{
          territory: "CO",
          role: "statesubmitter",
          status: "active",
          approverList: [
            { email: "test@example.com", fullName: "Test Admin", territory: "MD" },
            { email: "test2@example.com", fullName: "Test Admin2", territory: "MD" },
            { email: "test3@example.com", fullName: "Test Admin3", territory: "MD" },
          ],
        }}
      />,
    );
    expect(screen.getByText("Test Admin,")).toBeInTheDocument();
    expect(screen.getByText("Test Admin2,")).toBeInTheDocument();
    expect(screen.getByText("Test Admin3")).toBeInTheDocument();
  });

  it("should display No Approvers if the approver list is empty", async () => {
    render(
      <RoleStatusCard
        isNewUserRoleDisplay={mockUserRoleFeatureFlag}
        role="statesubmitter"
        access={{
          territory: "CO",
          role: "statesubmitter",
          status: "active",
          approverList: [],
        }}
      />,
    );

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });
});
