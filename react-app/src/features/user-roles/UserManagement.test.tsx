import { screen, waitForElementToBeRemoved, within } from "@testing-library/react";
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
import { describe, expect, it } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { UserManagement } from "./UserManagement";

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
});
