import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import {
  cmsRoleApprover,
  multiStateSubmitter,
  noStateSubmitter,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { beforeEach, describe, expect, test } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { MyProfile } from ".";

describe("MyProfile", () => {
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
    screen.debug();

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
