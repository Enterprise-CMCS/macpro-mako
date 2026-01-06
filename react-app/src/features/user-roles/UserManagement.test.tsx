import { screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CMS_ROLE_APPROVER_EMAIL,
  cmsRoleApprover,
  helpDeskUser,
  osStateSystemAdmin,
  roleDocs,
  setMockUsername,
  systemAdmin,
} from "mocks";
import { describe, expect, it, vi } from "vitest";

import * as api from "@/api";
import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { UserManagement } from "./UserManagement";
import { UserRoleType } from "./utils";

describe("UserManagement", () => {
  const setup = async () => {
    const user = userEvent.setup();
    const rendered = renderWithQueryClientAndMemoryRouter(
      <UserManagement />,
      [
        {
          path: "/",
          element: <div>Home</div>,
        },
        {
          path: "/usermanagement",
          element: <UserManagement />,
        },
      ],
      {
        initialEntries: [
          {
            pathname: "/usermanagement",
          },
        ],
      },
    );
    if (screen.queryAllByLabelText("three-dots-loading")?.length > 0) {
      await waitForElementToBeRemoved(() => screen.queryAllByLabelText("three-dots-loading"));
    }
    return {
      ...rendered,
      user,
    };
  };

  it("should display all the role requests for the state for a state system admin", async () => {
    setMockUsername(osStateSystemAdmin);
    const { user } = await setup();

    expect(screen.getByRole("table")).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows[0].textContent).toEqual(
      "Actions" + "Name" + "Status" + "Last Modified" + "Modified By",
    );

    // Pending User, pending should be first
    expect(within(rows[1]).getByRole("button")).toBeInTheDocument();
    await user.click(within(rows[1]).getByRole("button"));
    expect(within(screen.getByRole("dialog")).queryByText("Grant Access")).toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).queryByText("Deny Access")).toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).queryByText("Revoke Access")).not.toBeInTheDocument();
    expect(within(rows[1]).getByRole("cell", { name: "Pending State" })).toBeInTheDocument();
    expect(within(rows[1]).getByRole("cell", { name: "Pending" })).toBeInTheDocument();

    // Denied User
    expect(within(rows[2]).getByRole("button")).toBeInTheDocument();
    await user.click(within(rows[2]).getByRole("button"));
    expect(within(screen.getByRole("dialog")).queryByText("Grant Access")).toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).queryByText("Deny Access")).not.toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).queryByText("Revoke Access")).not.toBeInTheDocument();
    expect(within(rows[2]).getByRole("cell", { name: "Denied State" })).toBeInTheDocument();
    expect(within(rows[2]).getByRole("cell", { name: "Denied" })).toBeInTheDocument();

    // Multi State User
    expect(within(rows[3]).getByRole("button")).toBeInTheDocument();
    await user.click(within(rows[3]).getByRole("button"));
    expect(within(screen.getByRole("dialog")).queryByText("Grant Access")).not.toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).queryByText("Deny Access")).not.toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).queryByText("Revoke Access")).toBeInTheDocument();
    expect(within(rows[3]).getByRole("cell", { name: "Multi State" })).toBeInTheDocument();
    expect(within(rows[3]).getByRole("cell", { name: "Granted" })).toBeInTheDocument();

    // Revoked State User
    expect(within(rows[4]).getByRole("button")).toBeInTheDocument();
    await user.click(within(rows[4]).getByRole("button"));
    expect(within(screen.getByRole("dialog")).queryByText("Grant Access")).toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).queryByText("Deny Access")).not.toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).queryByText("Revoke Access")).not.toBeInTheDocument();
    expect(within(rows[4]).getByRole("cell", { name: "Revoked State" })).toBeInTheDocument();
    expect(within(rows[4]).getByRole("cell", { name: "Revoked" })).toBeInTheDocument();

    // Statesubmitter User
    expect(within(rows[5]).getByRole("button")).toBeInTheDocument();
    await user.click(within(rows[5]).getByRole("button"));
    expect(within(screen.getByRole("dialog")).queryByText("Deny Access")).not.toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).queryByText("Grant Access")).not.toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).queryByText("Revoke Access")).toBeInTheDocument();
    expect(
      within(rows[5]).getByRole("cell", { name: "Statesubmitter Nightwatch" }),
    ).toBeInTheDocument();
    expect(within(rows[5]).getByRole("cell", { name: "Granted" })).toBeInTheDocument();

    // Stateuser user
    expect(within(rows[6]).getByRole("button")).toBeInTheDocument();
    await user.click(within(rows[6]).getByRole("button"));
    expect(within(screen.getByRole("dialog")).queryByText("Grant Access")).not.toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).queryByText("Deny Access")).not.toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).queryByText("Revoke Access")).toBeInTheDocument();
    expect(within(rows[6]).getByRole("cell", { name: "Stateuser Tester" })).toBeInTheDocument();
    expect(within(rows[6]).getByRole("cell", { name: "Granted" })).toBeInTheDocument();
  });

  it("hides users with active state system admin roles for state system admins", async () => {
    const mockRoleRequests: UserRoleType[] = [
      {
        id: "ssa@example.com_N/A_statesystemadmin",
        email: "ssa@example.com",
        fullName: "SSA User",
        role: "statesystemadmin",
        territory: "N/A",
        doneByEmail: "approver@example.com",
        doneByName: "Approver User",
        lastModifiedDate: 1745234449866,
        status: "active",
        eventType: "user-role",
      },
      {
        id: "ssa@example.com_MD_statesubmitter",
        email: "ssa@example.com",
        fullName: "SSA User",
        role: "statesubmitter",
        territory: "MD",
        doneByEmail: "approver@example.com",
        doneByName: "Approver User",
        lastModifiedDate: 1745234449866,
        status: "active",
        eventType: "user-role",
      },
      {
        id: "other@example.com_MD_statesubmitter",
        email: "other@example.com",
        fullName: "Other User",
        role: "statesubmitter",
        territory: "MD",
        doneByEmail: "approver@example.com",
        doneByName: "Approver User",
        lastModifiedDate: 1745234449866,
        status: "active",
        eventType: "user-role",
      },
    ];

    const userDetailsSpy = vi.spyOn(api, "useGetUserDetails").mockReturnValue({
      data: {
        id: "admin-user",
        eventType: "user-details",
        email: "admin@example.com",
        fullName: "Admin User",
        role: "statesystemadmin",
        states: ["MD"],
        division: "Admin Division",
        group: "Admin Group",
      },
    } as any);
    const roleRequestsSpy = vi.spyOn(api, "useGetRoleRequests").mockReturnValue({
      data: mockRoleRequests,
      isLoading: false,
      isFetching: false,
    } as any);
    const submitRoleRequestsSpy = vi.spyOn(api, "useSubmitRoleRequests").mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: false,
    } as any);

    await setup();

    expect(screen.queryByText("SSA User")).toBeNull();
    expect(screen.getByText("Other User")).toBeInTheDocument();

    userDetailsSpy.mockRestore();
    roleRequestsSpy.mockRestore();
    submitRoleRequestsSpy.mockRestore();
  });

  it("should display all the role requests except cmsroleapprovers and systemadmins for a cmsroleapprover", async () => {
    setMockUsername(cmsRoleApprover);
    await setup();

    expect(screen.getByRole("table")).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows[0].textContent).toEqual(
      "Actions" + "Name" + "State" + "Status" + "Role" + "Last Modified" + "Modified By",
    );

    const expectedRoles = roleDocs.filter(
      (roleObj) =>
        !["cmsroleapprover", "systemadmin"].includes(roleObj?.role) &&
        roleObj?.email !== CMS_ROLE_APPROVER_EMAIL,
    );
    expect(rows.length - 1).toEqual(expectedRoles.length);

    const expectedPendingRoles = expectedRoles.filter((roleObj) => roleObj?.status === "pending");

    for (let i = 1; i <= expectedPendingRoles.length; i++) {
      expect(within(rows[i]).getByRole("cell", { name: "Pending" })).toBeInTheDocument();
    }
  });

  it("should display all the role requests for the system admin", async () => {
    setMockUsername(systemAdmin);
    await setup();

    expect(screen.getByRole("table")).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows[0].textContent).toEqual(
      "Actions" + "Name" + "State" + "Status" + "Role" + "Last Modified" + "Modified By",
    );

    const expectedRoles = roleDocs.filter((roleObj) => roleObj?.email !== CMS_ROLE_APPROVER_EMAIL);
    expect(rows.length - 1).toEqual(expectedRoles.length);

    const expectedPendingRoles = expectedRoles.filter((roleObj) => roleObj?.status === "pending");

    for (let i = 1; i <= expectedPendingRoles.length; i++) {
      expect(within(rows[i]).getByRole("cell", { name: "Pending" })).toBeInTheDocument();
    }
  });

  it("should display all the role requests for the help desk", async () => {
    setMockUsername(helpDeskUser);
    await setup();

    expect(screen.getByRole("table")).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows[0].textContent).toEqual(
      "Name" + "State" + "Status" + "Role" + "Last Modified" + "Modified By",
    );

    const expectedRoles = roleDocs.filter((roleObj) => roleObj?.email !== CMS_ROLE_APPROVER_EMAIL);
    expect(rows.length - 1).toEqual(expectedRoles.length);

    const expectedPendingRoles = expectedRoles.filter((roleObj) => roleObj?.status === "pending");

    for (let i = 1; i <= expectedPendingRoles.length; i++) {
      expect(within(rows[i]).getByRole("cell", { name: "Pending" })).toBeInTheDocument();
    }
  });

  it("updates the status and modified by after confirming an action", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    const mockRoleRequests: UserRoleType[] = [
      {
        id: "pending@example.com_MD_statesubmitter",
        email: "pending@example.com",
        fullName: "Pending User",
        role: "statesubmitter",
        territory: "MD",
        doneByEmail: "approver@example.com",
        doneByName: "Original Approver",
        lastModifiedDate: 1745234449866,
        status: "pending",
        eventType: "user-role",
      },
    ];

    const userDetailsSpy = vi.spyOn(api, "useGetUserDetails").mockReturnValue({
      data: {
        id: "admin-user",
        eventType: "user-details",
        email: "admin@example.com",
        fullName: "Admin User",
        role: "systemadmin",
        states: ["MD"],
        division: "Admin Division",
        group: "Admin Group",
      },
    } as any);
    const roleRequestsSpy = vi.spyOn(api, "useGetRoleRequests").mockReturnValue({
      data: mockRoleRequests,
      isLoading: false,
      isFetching: false,
    } as any);
    const submitRoleRequestsSpy = vi.spyOn(api, "useSubmitRoleRequests").mockReturnValue({
      mutateAsync,
      isLoading: false,
    } as any);

    global.scrollTo = vi.fn();

    const { user } = await setup();

    const rowLabel = await screen.findByText("Pending User");
    const row = rowLabel.closest("tr");
    expect(row).not.toBeNull();

    await user.click(within(row as HTMLElement).getByRole("button"));
    await user.click(await screen.findByText("Grant Access"));
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      const updatedRow = screen.getByText("Pending User").closest("tr");
      expect(updatedRow).not.toBeNull();
      expect(within(updatedRow as HTMLElement).getByText("Granted")).toBeInTheDocument();
      expect(within(updatedRow as HTMLElement).getByText("Admin User")).toBeInTheDocument();
    });

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "pending@example.com",
        grantAccess: "active",
        requestRoleChange: false,
      }),
    );

    userDetailsSpy.mockRestore();
    roleRequestsSpy.mockRestore();
    submitRoleRequestsSpy.mockRestore();
  });
});
