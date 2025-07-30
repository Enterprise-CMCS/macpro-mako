import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultCMSUser, setMockUsername } from "mocks";
import { describe, expect, it, vi } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { CMSConfirmation } from "./cmsConfirmation";

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// mock submitRoleRequests
const mockSubmit = vi.fn();
vi.mock("@/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/api");
  return {
    ...actual,
    useSubmitRoleRequests: () => ({
      mutateAsync: mockSubmit,
    }),
    useGetUserDetails: actual.useGetUserDetails,
  };
});

describe("CMSConfirmation", () => {
  const setup = async (query: string = "?role=cmsroleapprover") => {
    setMockUsername(defaultCMSUser);
    const user = userEvent.setup();
    const rendered = renderWithQueryClientAndMemoryRouter(
      <CMSConfirmation />,
      [
        { path: "/", element: <div>Home</div> },
        { path: "/profile", element: <div>Profile</div> },
        { path: "/signup/cms/confirm", element: <CMSConfirmation /> },
      ],
      {
        initialEntries: [{ pathname: "/signup/cms/confirm", search: query }],
      },
    );

    if (screen.queryByLabelText("three-dots-loading")) {
      await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));
    }

    return { ...rendered, user };
  };

  it("should call submitRequest and navigate to /profile on submit", async () => {
    mockSubmit.mockResolvedValueOnce({});
    const { user } = await setup();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("/profile");
    });
  });

  it("should not navigate to /profile if submitRequest fails", async () => {
    mockSubmit.mockRejectedValueOnce(new Error("fail"));
    const { user } = await setup();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalledWith("/profile");
    });
  });

  it("should navigate to /profile on cancel", async () => {
    const { user } = await setup();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});
