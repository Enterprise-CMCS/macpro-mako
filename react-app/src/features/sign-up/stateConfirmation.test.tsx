import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { osStateSystemAdmin, setMockUsername } from "mocks";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { StateConfirmation } from "./stateConfirmation";

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();
const mockBanner = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/signup/state/role/confirm" }),
  };
});

vi.mock("@/api", () => ({
  useSubmitRoleRequests: () => ({ mutateAsync: mockMutateAsync }),
  useGetUser: vi.fn(() => ({
    data: { user: { email: "test@test.com" } },
  })),
  useGetUserDetails: vi.fn(() => ({
    data: { user: { email: "test@test.com" } },
  })),
}));

vi.mock("react-app/src/components/Banner/banner", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    banner: mockBanner,
  };
});

describe("StateConfirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = async (query: string = "?role=statesubmitter&states=CA,VA") => {
    setMockUsername(osStateSystemAdmin);

    const user = userEvent.setup();
    const rendered = renderWithQueryClientAndMemoryRouter(
      <StateConfirmation />,
      [
        { path: "/", element: <div>Home</div> },
        { path: "/profile", element: <div>Profile</div> },
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

    expect(mockNavigate).toHaveBeenCalledWith("/signup/state/role?states=CA,VA");
  });

  it("should call mutate for each state and navigate to home on success", async () => {
    mockMutateAsync.mockResolvedValue({ message: "success" });
    const { user } = await setup();

    await user.click(screen.getByRole("button", { name: "Submit role request" }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: "test@test.com",
        role: "statesubmitter",
        state: "CA",
        eventType: "user-role",
        requestRoleChange: true,
      });
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: "test@test.com",
        role: "statesubmitter",
        state: "VA",
        eventType: "user-role",
        requestRoleChange: true,
      });
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("should show an error banner if one of the requests fails", async () => {
    mockMutateAsync.mockImplementation((request) => {
      if (request.state === "CA") {
        return Promise.reject(new Error("API Error"));
      }
      return Promise.resolve({ message: "success" });
    });
    const { user } = await setup();

    await user.click(screen.getByRole("button", { name: "Submit role request" }));

    await waitFor(() => {
      expect(mockBanner).toHaveBeenCalledWith({
        variant: "destructive",
        header: "Error submitting role requests",
        body: "Some role requests could not be submitted. Please try again.",
        pathnameToDisplayOn: "/signup/state/role/confirm",
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("should not call mutate if user data is not available", async () => {
    const { useGetUser } = await import("@/api");
    (useGetUser as Mock).mockReturnValue({ data: { user: null } });
    const { user } = await setup();

    await user.click(screen.getByRole("button", { name: "Submit role request" }));

    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });
});
