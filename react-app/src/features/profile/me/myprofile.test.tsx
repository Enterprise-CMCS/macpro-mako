import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  cmsRoleApprover,
  multiStateSubmitter,
  noStateSubmitter,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { useSubmitRoleRequests } from "@/api";
import * as components from "@/components";
import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { MyProfile } from ".";

let mockUserRoleFeatureFlag = false;

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => {
    if (flag === "isNewUserRoleDisplay") return mockUserRoleFeatureFlag;
    return false;
  },
}));

vi.mock("@/api/useSubmitRoleRequests", async () => {
  const actual = await vi.importActual<typeof import("@/api/useSubmitRoleRequests")>(
    "@/api/useSubmitRoleRequests",
  );
  return {
    ...actual,
    useSubmitRoleRequests: () => ({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isLoading: false,
    }),
  };
});

describe("MyProfile", () => {
  const bannerSpy = vi.spyOn(components, "banner");

  const setup = async () => {
    const rendered = renderWithQueryClientAndMemoryRouter(
      <MyProfile />,
      [
        {
          path: "/profile",
          element: <MyProfile />,
        },
        {
          path: "/",
          element: <div data-testid="home">Home</div>,
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
    setDefaultStateSubmitter();
    mockUserRoleFeatureFlag = false;
  });

  test("redirects to / for non-authenticated users", async () => {
    setMockUsername(null);

    await setup();

    await screen.findByTestId("home");

    expect(screen.queryByTestId("home")).toBeInTheDocument();
  });

  test("renders state names", async () => {
    setMockUsername(multiStateSubmitter);

    await setup();

    await waitFor(() => expect(screen.getByText("Multi State")).toBeInTheDocument());

    expect(screen.queryByText("California")).toBeInTheDocument();
    expect(screen.queryByText("New York")).toBeInTheDocument();
    expect(screen.queryByText("Maryland")).toBeInTheDocument();
  });

  test("shows Add State button when showAddState is true", async () => {
    setMockUsername(multiStateSubmitter);

    await setup();

    const addButton = screen.queryByText("Add State");
    expect(addButton).toBeInTheDocument();
  });

  test("clicking state State reveals form with submit and cancel", async () => {
    setMockUsername(multiStateSubmitter);

    await setup();

    const addStateButton = screen.getByText("Add State");
    addStateButton.click();

    await waitFor(() => {
      expect(screen.getByText("Choose State Access")).toBeInTheDocument();
      expect(screen.getByText("Submit")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
  });

  test("calls `banner` with `bannerPostSubmission`", async () => {
    vi.mock("@/hooks/useAvailableStates", () => {
      return {
        useAvailableStates: vi.fn().mockReturnValue([{ label: "Arizona", value: "AZ" }]),
      };
    });

    setMockUsername(multiStateSubmitter);

    await setup();

    const addStateButton = screen.getByText("Add State");
    addStateButton.click();

    await waitFor(() => {
      expect(screen.getByText("Choose State Access")).toBeInTheDocument();
      expect(screen.getByText("Submit")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByText("Arizona"));

    const submitBtn = screen.getByText("Submit");
    submitBtn.click();

    await waitFor(() =>
      expect(bannerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          header: "Submission Completed",
        }),
      ),
    );
  });

  test("self revoking access shows modal", async () => {
    setMockUsername(multiStateSubmitter);

    await setup();

    const revokeStateButton = screen.queryAllByTestId("self-revoke");
    await revokeStateButton[0].click();
    expect(screen.getByRole("dialog", { name: /Withdraw State Access/i })).toBeInTheDocument();
  });

  test("self revoking removes access to state", async () => {
    setMockUsername(multiStateSubmitter);

    await setup();

    const revokeStateButton = screen.queryAllByTestId("self-revoke");
    expect(revokeStateButton.length).toEqual(3);

    await revokeStateButton[1].click();
    expect(screen.getByRole("dialog", { name: /Withdraw State Access/i })).toBeInTheDocument();

    const confirmRevokeButton = screen.getByTestId("dialog-accept");
    await confirmRevokeButton.click();
    await waitFor(() =>
      expect(bannerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          header: "Submission Completed",
        }),
      ),
    );
  });

  test("renders nothing if user has no states", async () => {
    setMockUsername(noStateSubmitter);

    await setup();

    await waitFor(() => expect(screen.getByText("No State")).toBeInTheDocument());
    expect(screen.queryByText("Access Granted")).not.toBeInTheDocument();
  });

  test("renders roles", async () => {
    await setup();

    await waitFor(() => expect(screen.getByText("State Submitter")).toBeInTheDocument());

    expect(screen.queryByText("Virginia")).toBeInTheDocument();
    expect(screen.queryByText("Ohio")).toBeInTheDocument();
    expect(screen.queryByText("South Carolina")).toBeInTheDocument();
    expect(screen.queryByText("Colorado")).toBeInTheDocument();
    expect(screen.queryByText("Georgia")).toBeInTheDocument();
    expect(screen.queryByText("Maryland")).toBeInTheDocument();
  });

  test("renders full name", async () => {
    await setup();

    await waitFor(() => expect(screen.getByText("Stateuser Tester")).toBeInTheDocument());
  });

  test("renders email", async () => {
    await setup();

    await waitFor(() => expect(screen.getByText("mako.stateuser@gmail.com")).toBeInTheDocument());
  });

  test("renders state access control for statesubmitters", async () => {
    setMockUsername(multiStateSubmitter);
    await setup();

    const addStateButton = screen.queryByText("Add State");
    addStateButton.click();

    await waitFor(() => expect(screen.queryByText("Choose State Access")).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText("Submit")).toBeInTheDocument());
  });

  test("renders group and divisions for cmsroleapprovers", async () => {
    setMockUsername(cmsRoleApprover);
    await setup();
    await waitFor(() => expect(screen.queryByText("Choose State Access")).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText("Group & Division")).toBeInTheDocument());
  });

  test("hides state access control for non statesubmitter users", async () => {
    setMockUsername(noStateSubmitter);
    await setup();
    expect(screen.queryByText("Choose State Access")).not.toBeInTheDocument();
    expect(screen.queryByText("Add State")).not.toBeInTheDocument();
  });
});
