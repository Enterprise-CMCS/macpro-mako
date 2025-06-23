import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RoleStatusCard } from "./index";

const mockUserRoleFeatureFlag = false;

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => {
    if (flag === "NEW_USER_ROLE_DISPLAY") return mockUserRoleFeatureFlag;
    return false;
  },
}));

describe("RoleStatusCard", () => {
  it("should handle an undefined access", () => {
    // @ts-ignore
    render(<RoleStatusCard />);
    expect(screen.queryByText("State System Admin: ")).toBeNull();
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
          doneByEmail: "test@example.com",
          doneByName: "Test Admin",
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
          doneByEmail: "test@example.com",
          doneByName: "Test Admin",
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "MD", level: 3 })).toBeInTheDocument();
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
          doneByEmail: "test@example.com",
          doneByName: "Test Admin",
        }}
        onClick={revokeSpy}
      />,
    );
    expect(screen.getByRole("heading", { name: "CO", level: 3 })).toBeInTheDocument();

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
          doneByEmail: "test@example.com",
          doneByName: "Test Admin",
          approverList: [
            { email: "test@example.com", fullName: "Test Admin" },
            { email: "test2@example.com", fullName: "Test Admin2" },
            { email: "test3@example.com", fullName: "Test Admin3" },
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
          doneByEmail: "test@example.com",
          doneByName: "Test Admin",
          approverList: [],
        }}
      />,
    );

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });
});
