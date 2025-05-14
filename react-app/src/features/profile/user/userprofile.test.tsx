import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import { multiStateSubmitter, setMockUsername, systemAdmin } from "mocks";
import { beforeEach, describe, expect, test } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { UserProfile } from ".";

describe("User Profile", () => {
  const mockLoader = () => {
    return {
      userDetails: {
        id: "123",
        role: "statesubmitter",
        fullName: "Submitter Tester",
        email: "mako.stateuser@gmail.com",
      },
      userProfile: {
        stateAccess: [
          { territory: "CA", status: "active", role: "statesubmitter", doneByName: "George" },
        ],
      },
    };
  };

  const setup = async (mockLoader) => {
    const rendered = renderWithQueryClientAndMemoryRouter(
      <UserProfile />,
      [
        {
          path: "/profile",
          element: <UserProfile />,
          loader: mockLoader,
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
            pathname: "/profile",
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
  });

  test("renders state access management", async () => {
    await setup(mockLoader);
    await waitFor(() => expect(screen.getByText("State Access Management")).toBeInTheDocument());

    expect(screen.queryByText("California")).toBeInTheDocument();
    screen.debug();
  });

  test("renders full name", async () => {
    await setup(mockLoader);

    await waitFor(() => expect(screen.getByText("Submitter Tester")).toBeInTheDocument());
  });

  test("renders email", async () => {
    await setup(mockLoader);

    await waitFor(() => expect(screen.getByText("mako.stateuser@gmail.com")).toBeInTheDocument());
  });

  test("render groups for cmsroleapprover", async () => {
    const cmsMockLoader = () => {
      return {
        userDetails: {
          id: "123",
          role: "cmsroleapprover",
          email: "cmsroleapprover@gmail.com",
        },
        userProfile: multiStateSubmitter,
      };
    };
    await setup(cmsMockLoader);

    await waitFor(() => expect(screen.getByText("Group & Division")).toBeInTheDocument());
  });
});
