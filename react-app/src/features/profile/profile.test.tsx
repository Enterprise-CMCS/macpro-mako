import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import {
  multiStateSubmitter,
  noStateSubmitter,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { beforeEach, describe, expect, test } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { Profile } from ".";

describe("Profile", () => {
  const setup = async () => {
    const rendered = renderWithQueryClientAndMemoryRouter(
      <Profile />,
      [
        {
          path: "/profile",
          element: <Profile />,
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

    await waitFor(() =>
      expect(screen.getByText("California, New York, Maryland")).toBeInTheDocument(),
    );
  });

  test("renders nothing if user has no states", async () => {
    setMockUsername(noStateSubmitter);

    await setup();

    await waitFor(() => expect(screen.queryByText("Access Granted")).not.toBeInTheDocument());
  });

  test("renders roles", async () => {
    await setup();

    await waitFor(() => expect(screen.getByText("State Submitter")).toBeInTheDocument());
  });

  test("renders full name", async () => {
    await setup();

    await waitFor(() => expect(screen.getByText("Stateuser Tester")).toBeInTheDocument());
  });

  test("renders email", async () => {
    await setup();
    screen.debug();

    await waitFor(() => expect(screen.getByText("mako.stateuser@gmail.com")).toBeInTheDocument());
  });
});
