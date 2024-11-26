import { screen, waitFor } from "@testing-library/react";
import { describe, test, expect, afterEach, vi } from "vitest";
import { Profile } from ".";
import { setMockUsername, useDefaultStateSubmitter, multiStateSubmitter } from "mocks";
import { renderWithQueryClient } from "@/utils/test-helpers/renderForm";
import * as api from "@/api";

const renderComponent = async () => {
  const spy = vi.spyOn(api, "useGetUser");

  renderWithQueryClient(<Profile />);

  await waitFor(() =>
    expect(spy).toHaveLastReturnedWith(
      expect.objectContaining({
        status: "success",
      }),
    ),
  );
};

describe("Profile", () => {
  afterEach(() => {
    useDefaultStateSubmitter();
    vi.resetAllMocks();
  });

  test("renders state names", async () => {
    setMockUsername(multiStateSubmitter.Username);

    await renderComponent();

    const states = screen.getByText("California, New York, Maryland");

    expect(states).toBeInTheDocument();
  });

  test("renders nothing if user has no states", async () => {
    await renderComponent();

    const accessGranted = screen.queryByText("Access Granted");

    expect(accessGranted).not.toBeInTheDocument();
  });

  test("renders roles", async () => {
    await renderComponent();

    const states = screen.getByText("State Submitter");

    expect(states).toBeInTheDocument();
  });

  test("renders full name", async () => {
    await renderComponent();

    const states = screen.getByText("George Harrison");

    expect(states).toBeInTheDocument();
  });

  test("renders email", async () => {
    await renderComponent();

    const states = screen.getByText("george@example.com");

    expect(states).toBeInTheDocument();
  });
});
