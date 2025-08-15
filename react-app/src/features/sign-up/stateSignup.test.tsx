import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  defaultCMSUser,
  errorApiSubmitRoleRequestsHandler,
  osStateSubmitter,
  osStateSystemAdmin,
  setMockUsername,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { SignUp } from "./sign-up";
import { StateSignup } from "./stateSignup";

let mockUserRoleFeatureFlag = false;

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => {
    if (flag === "SHOW_USER_ROLE_UPDATE") return mockUserRoleFeatureFlag;
    return false;
  },
}));

describe("StateSignup", () => {
  beforeEach(() => {
    mockUserRoleFeatureFlag = false;
  });

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
          element: <SignUp />,
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

    await waitFor(() => expect(screen.getByText("Home")).toBeInTheDocument());
  });

  it("should navigate to /profile if the user is not a State user", async () => {
    setMockUsername(defaultCMSUser);
    await setup();

    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("should show the form if SHOW_USER_ROLE_UPDATE is enabled", async () => {
    mockUserRoleFeatureFlag = true;
    setMockUsername(osStateSystemAdmin);
    await setup();

    expect(screen.getByText("Choose States For Access")).toBeInTheDocument();
    expect(screen.getByText("Select your State Access")).toBeInTheDocument();
  });

  it("should show continue signup if SHOW_USER_ROLE_UPDATE is enabled and user selects at least one state", async () => {
    mockUserRoleFeatureFlag = true;
    setMockUsername(osStateSystemAdmin);
    const { user } = await setup();

    await user.click(screen.getByRole("combobox"));
    await waitFor(() => expect(screen.getByText("California, CA")).toBeInTheDocument());
    await user.click(screen.getByText("California, CA"));

    const continueButton = screen.getByRole("button", { name: "Continue" });

    await user.click(continueButton);
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

  it("should handle filling out the form as a statesubmitter", async () => {
    setMockUsername(osStateSubmitter);
    const { user } = await setup();

    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole("combobox", { name: /Select state/ }));
    expect(submitButton).toBeDisabled();

    await waitFor(() => expect(screen.getByText("Maine")).toBeInTheDocument());
    await user.click(screen.getByText("Maine"));
    await waitFor(() => expect(submitButton).toBeEnabled());

    await user.click(submitButton);

    await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
  });

  it("should handle cancelling the form", async () => {
    setMockUsername(osStateSubmitter);
    const { user } = await setup();

    const cancelButton = screen.getByRole("button", { name: "Cancel" });

    await user.click(cancelButton);
    await waitFor(() =>
      expect(screen.getByText("Changes you made will not be saved.")).toBeInTheDocument(),
    );

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    await user.click(confirmButton);

    await waitFor(() => expect(screen.getByText(/Registration: User Role/)).toBeInTheDocument());
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
