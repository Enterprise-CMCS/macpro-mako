import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  errorApiSubmitRoleRequestsHandler,
  osStateSubmitter,
  osStateSystemAdmin,
  readOnlyUser,
  setMockUsername,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { StateSignup } from "./stateSignup";

describe("StateSignup", () => {
  const setup = async () => {
    const user = userEvent.setup();
    const rendered = renderWithQueryClientAndMemoryRouter(
      <StateSignup />,
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
          path: "/dashboard",
          element: <div>Dashboard</div>,
        },
        {
          path: "/signup",
          element: <div>Signup</div>,
        },
        {
          path: "/signup/state",
          element: <StateSignup />,
        },
      ],
      {
        initialEntries: [
          {
            pathname: "/signup/state",
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

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("should navigate to /profile if the user is not a State user", async () => {
    setMockUsername(readOnlyUser);
    await setup();

    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("should show the form if the user is a statesystemadmin", async () => {
    setMockUsername(osStateSystemAdmin);
    await setup();

    expect(screen.getByText("Registration: State Access")).toBeInTheDocument();
    expect(screen.getByText("State Submitter")).toBeInTheDocument();
  });

  it("should show the form if the user is a statesubmitter", async () => {
    setMockUsername(osStateSubmitter);
    await setup();

    expect(screen.getByText("Registration: State Access")).toBeInTheDocument();
    expect(screen.getByText("State System Admin")).toBeInTheDocument();
  });

  it("should handle filling out the form", async () => {
    setMockUsername(osStateSubmitter);
    const { user } = await setup();

    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole("combobox", { name: /Select state/ }));
    expect(submitButton).toBeDisabled();

    await waitFor(() => expect(screen.getByText("Maine")).toBeInTheDocument());
    await user.click(screen.getByText("Maine"));
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
  });

  it("should show an error if there was an error submitting the request", async () => {
    mockedServer.use(errorApiSubmitRoleRequestsHandler);
    setMockUsername(osStateSubmitter);
    const { user } = await setup();

    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole("combobox", { name: /Select state/ }));
    expect(submitButton).toBeDisabled();

    await waitFor(() => expect(screen.getByText("Maine")).toBeInTheDocument());
    await user.click(screen.getByText("Maine"));
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    await waitFor(() => expect(screen.getByText("Registration: State Access")).toBeInTheDocument());
  });
});
