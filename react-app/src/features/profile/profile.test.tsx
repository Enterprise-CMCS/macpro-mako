import { screen, waitFor } from "@testing-library/react";
import { describe, test, expect, afterEach } from "vitest";
import { Profile } from ".";
import { setMockUsername, useDefaultStateSubmitter, multiStateSubmitter } from "mocks";
import { renderWithQueryClient } from "@/utils/test-helpers/renderForm";

describe("Profile", () => {
  afterEach(() => {
    useDefaultStateSubmitter();
  });

  test("renders state names", async () => {
    setMockUsername(multiStateSubmitter.Username);

    renderWithQueryClient(<Profile />);

    await waitFor(() =>
      expect(screen.getByText("California, New York, Maryland")).toBeInTheDocument(),
    );
  });

  test("renders nothing if user has no states", async () => {
    renderWithQueryClient(<Profile />);

    await waitFor(() => expect(screen.queryByText("Access Granted")).not.toBeInTheDocument());
  });

  test("renders roles", async () => {
    renderWithQueryClient(<Profile />);

    await waitFor(() => expect(screen.getByText("State Submitter")).toBeInTheDocument());
  });

  test("renders full name", async () => {
    renderWithQueryClient(<Profile />);

    await waitFor(() => expect(screen.getByText("Stateuser Tester")).toBeInTheDocument());
  });

  test("renders email", async () => {
    renderWithQueryClient(<Profile />);

    await waitFor(() => expect(screen.getByText("mako.stateuser@gmail.com")).toBeInTheDocument());
  });
});
