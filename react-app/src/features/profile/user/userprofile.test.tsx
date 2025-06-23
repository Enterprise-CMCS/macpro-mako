import { screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react";
import LZ from "lz-string";
import {
  CMS_ROLE_APPROVER_EMAIL,
  DEFAULT_CMS_USER_EMAIL,
  setMockUsername,
  STATE_SYSTEM_ADMIN_EMAIL,
  stateSubmitter,
  SYSTEM_ADMIN_EMAIL,
  systemAdmin,
  TEST_STATE_SUBMITTER_EMAIL,
} from "mocks";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { UserProfile, userProfileLoader } from ".";

let mockUserRoleFeatureFlag = false;

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => {
    if (flag === "isNewUserRoleDisplay") return mockUserRoleFeatureFlag;
    return false;
  },
}));

describe("User Profile", () => {
  const setup = async (userEmail) => {
    const rendered = renderWithQueryClientAndMemoryRouter(
      <UserProfile />,
      [
        {
          path: "/profile/:profileId",
          element: <UserProfile />,
          loader: userProfileLoader,
          HydrateFallback: () => null,
        },
        {
          path: "/",
          element: <div data-testid="home">Home</div>,
        },
        {
          path: "/usermanagement",
          element: <div data-testid="usermanagement">User Management</div>,
        },
      ],
      {
        initialEntries: [
          {
            pathname: `/profile/${userEmail ? LZ.compressToEncodedURIComponent(userEmail).replaceAll("+", "_") : ""}`,
          },
        ],
      },
    );
    if (screen.queryAllByLabelText("three-dots-loading")?.length > 0) {
      await waitForElementToBeRemoved(() => screen.queryAllByLabelText("three-dots-loading"));
    }
    return rendered;
  };

  beforeEach(() => {
    setMockUsername(systemAdmin);
    mockUserRoleFeatureFlag = false;
  });

  test("should redirect to / if the user is not a user manager role", async () => {
    setMockUsername(stateSubmitter);
    await setup(TEST_STATE_SUBMITTER_EMAIL);
    expect(screen.queryByText("User Profile")).toBeNull();
  });

  test("renders state access management", async () => {
    await setup(TEST_STATE_SUBMITTER_EMAIL);
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Profile Information", level: 2 }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: "Full Name", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("Stateuser Tester")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Role", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("State Submitter")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Email", level: 3 })).toBeInTheDocument();
    expect(screen.getByText(TEST_STATE_SUBMITTER_EMAIL)).toBeInTheDocument();

    expect(screen.getByText("State Access Management")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Colorado", level: 3 })).toBeInTheDocument(),
    );
    const coAccess = screen.getByRole("heading", { name: "Colorado", level: 3 }).parentNode
      .parentNode.parentElement;
    expect(within(coAccess).getByText("Access Granted")).toBeInTheDocument();
    expect(within(coAccess).getByText(/State System Admin/)).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Georgia", level: 3 })).toBeInTheDocument();
    const gaAccess = screen.getByRole("heading", { name: "Georgia", level: 3 }).parentNode
      .parentNode.parentElement;
    expect(within(gaAccess).getByText("Access Granted")).toBeInTheDocument();
    expect(within(gaAccess).getByText(/State System Admin/)).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Maryland", level: 3 })).toBeInTheDocument();
    const mdAccess = screen.getByRole("heading", { name: "Maryland", level: 3 }).parentNode
      .parentNode.parentElement;
    expect(within(mdAccess).getByText("Access Granted")).toBeInTheDocument();
    expect(within(mdAccess).getByText(/State System Admin/)).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Ohio", level: 3 })).toBeInTheDocument();
    const ohAccess = screen.getByRole("heading", { name: "Ohio", level: 3 }).parentNode.parentNode
      .parentElement;
    expect(within(ohAccess).getByText("Access Granted")).toBeInTheDocument();
    expect(within(ohAccess).getByText(/State System Admin/)).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "South Carolina", level: 3 })).toBeInTheDocument();
    const scAccess = screen.getByRole("heading", { name: "South Carolina", level: 3 }).parentNode
      .parentNode.parentElement;
    expect(within(scAccess).getByText("Access Granted")).toBeInTheDocument();
    expect(within(scAccess).getByText(/State System Admin/)).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Virginia", level: 3 })).toBeInTheDocument();
    const vaAccess = screen.getByRole("heading", { name: "Virginia", level: 3 }).parentNode
      .parentNode.parentElement;
    expect(within(vaAccess).getByText("Access Granted")).toBeInTheDocument();
    expect(within(vaAccess).getByText(/State System Admin/)).toBeInTheDocument();

    expect(screen.queryByRole("heading", { name: "Status", level: 2 })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Group & Division", level: 2 })).toBeNull();
  });

  test("renders State Access Management for statesystemadmin", async () => {
    await setup(STATE_SYSTEM_ADMIN_EMAIL);
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "State Access Management", level: 2 }),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByRole("heading", { name: "Status", level: 2 })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Group & Division", level: 2 })).toBeNull();
  });

  test("renders Status if the user is not a statesubmitter or statesystemadmin", async () => {
    await setup(DEFAULT_CMS_USER_EMAIL);
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Status", level: 2 })).toBeInTheDocument(),
    );
    expect(screen.queryByRole("heading", { name: "State Access Management", level: 2 })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Group & Division", level: 2 })).toBeNull();
  });

  test("renders Status if the user is not a statesubmitter or statesystemadmin", async () => {
    await setup(SYSTEM_ADMIN_EMAIL);
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Status", level: 2 })).toBeInTheDocument(),
    );
    expect(screen.queryByRole("heading", { name: "State Access Management", level: 2 })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Group & Division", level: 2 })).toBeNull();
  });

  test("renders Group & Division if the user is a cmsroleapprover", async () => {
    await setup(CMS_ROLE_APPROVER_EMAIL);
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Status", level: 2 })).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: "Group & Division", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Group:/, level: 3 })).toBeInTheDocument();
    expect(screen.getByText("Group 1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Division:/, level: 3 })).toBeInTheDocument();
    expect(screen.getByText("Division 1")).toBeInTheDocument();

    expect(screen.queryByRole("heading", { name: "State Access Management", level: 2 })).toBeNull();
  });
});
