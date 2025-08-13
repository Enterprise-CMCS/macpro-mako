import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CO_STATE_SUBMITTER_USERNAME, setMockUsername, TEST_STATE_SYSTEM_ADMIN_USER } from "mocks";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as component from "@/components";
import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { StateConfirmation } from "./stateConfirmation";

const mutateAsyncSpy = vi.fn();
vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useSubmitRoleRequests: () => ({ mutateAsync: mutateAsyncSpy }),
  };
});

const bannerSpy = vi.spyOn(component, "banner");
const promptSpy = vi.spyOn(component, "userPrompt");

describe("StateConfirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockUsername(TEST_STATE_SYSTEM_ADMIN_USER.username);
  });

  const setup = async (query: string = "?role=statesubmitter&states=CA,VA") => {
    const user = userEvent.setup();
    const rendered = renderWithQueryClientAndMemoryRouter(
      <StateConfirmation />,
      [
        { path: "/", element: <div>Home</div> },
        { path: "/profile", element: <div>Profile</div> },
        { path: "/signup/state/role", element: <div>State Role</div> },
        { path: "/signup/state/role/confirm", element: <StateConfirmation /> },
      ],
      {
        initialEntries: [{ pathname: "/signup/state/role/confirm", search: query }],
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

  it("should navigate to /signup/state/role on cancel", async () => {
    const { user } = await setup();

    await user.click(screen.getByRole("button", { name: "Cancel role request" }));

    expect(promptSpy).toBeCalledWith({
      header: "Cancel role request?",
      body: "Changes you made will not be saved.",
      onAccept: expect.any(Function),
      onCancel: expect.any(Function),
      acceptButtonText: "Confirm",
      cancelButtonText: "Stay on Page",
    });
  });

  it("should call mutate for each state and navigate to home on success", async () => {
    const { user } = await setup();

    await user.click(screen.getByRole("button", { name: "Submit role request" }));

    await waitFor(() => {
      expect(mutateAsyncSpy).toHaveBeenCalledTimes(2);
    });
    expect(mutateAsyncSpy).toHaveBeenCalledWith({
      email: TEST_STATE_SYSTEM_ADMIN_USER.email,
      role: "statesubmitter",
      state: "CA",
      eventType: "user-role",
      requestRoleChange: true,
    });
    expect(mutateAsyncSpy).toHaveBeenCalledWith({
      email: TEST_STATE_SYSTEM_ADMIN_USER.email,
      role: "statesubmitter",
      state: "VA",
      eventType: "user-role",
      requestRoleChange: true,
    });
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("should show an error banner if one of the requests fails", async () => {
    mutateAsyncSpy.mockRejectedValueOnce(`Oops`);
    const { user } = await setup();

    await user.click(screen.getByRole("button", { name: "Submit role request" }));

    await waitFor(() => {
      expect(bannerSpy).toHaveBeenCalledWith({
        variant: "destructive",
        header: "Error submitting role requests",
        body: "Some role requests could not be submitted. Please try again.",
        pathnameToDisplayOn: "/signup/state/role/confirm",
      });
    });
  });

  it("should redirect to `/` if user data is not available", async () => {
    setMockUsername(CO_STATE_SUBMITTER_USERNAME);
    await setup();

    expect(screen.getByText("Home")).toBeInTheDocument();
  });
});
