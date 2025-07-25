import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { osStateSystemAdmin, setMockUsername } from "mocks";
import { describe, expect, it, vi } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { StateConfirmation } from "./stateConfirmation";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("StateConfirmation", () => {
  const setup = async (query: string = "?role=statesubmitter&states=CA") => {
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

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockNavigate).toHaveBeenCalledWith("/signup/state/role?states=CA");
  });
});
