import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultCMSUser, osStateSystemAdmin, setMockUsername } from "mocks";
import { describe, expect, it, vi } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { StateRoleSignup } from "./stateRoleSignup";

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => {
    if (flag === "SHOW_USER_ROLE_UPDATE") return true;
    return false;
  },
}));

describe("StateRoleSignup", () => {
  const setup = async () => {
    const user = userEvent.setup();
    const rendered = renderWithQueryClientAndMemoryRouter(
      <StateRoleSignup />,
      [
        {
          path: "/",
          element: <div>Home</div>,
        },
        {
          path: "/profile",
          element: <div>Profile</div>,
        },
        {
          path: "/signup/state/role",
          element: <StateRoleSignup />,
        },
      ],
      {
        initialEntries: [
          {
            pathname: "/signup/state/role",
            search: "?states=CA",
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

  it("should navigate to / if the user is not logged in", async () => {
    setMockUsername(null);
    await setup();

    await waitFor(() => expect(screen.getByText("Home")).toBeInTheDocument());
  });

  it("should navigate to /profile if the user is not a State user", async () => {
    setMockUsername(defaultCMSUser);
    await setup();

    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("should show the available roles to request if the user selected at least one state", async () => {
    setMockUsername(osStateSystemAdmin);
    await setup();

    expect(screen.getByText(/Select A Role/)).toBeInTheDocument();
    expect(screen.getByText("State:")).toBeInTheDocument();
    expect(screen.getByText("State Submitter")).toBeInTheDocument();
    expect(screen.getByText("State System Administrator")).toBeInTheDocument();
  });
});
