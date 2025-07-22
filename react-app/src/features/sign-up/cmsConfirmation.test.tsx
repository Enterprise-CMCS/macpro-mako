import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultCMSUser, errorApiSubmitRoleRequestsHandler, setMockUsername } from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { CMSConfirmation } from "./cmsConfirmation";

describe("CMSConfirmation", () => {
  const setup = async (query: string = "?role=CMS_APPROVER") => {
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

  it("should navigate to / if userDetails or role param is missing", async () => {
    setMockUsername(null);
    await setup();

    await waitFor(() => expect(screen.getByText("Home")).toBeInTheDocument());
  });

  it("should navigate to /profile if role is not allowed", async () => {
    setMockUsername({ ...defaultCMSUser, role: "norole" });
    await setup();

    await waitFor(() => expect(screen.getByText("Profile")).toBeInTheDocument());
  });

  it("should show confirmation UI if role is valid", async () => {
    await setup();

    expect(screen.getByText("Confirm Role Request")).toBeInTheDocument();
    expect(screen.getByText("You are requesting the following role:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("should submit and redirect to /profile", async () => {
    const { user } = await setup();

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(screen.getByText("Profile")).toBeInTheDocument());
  });

  it("should cancel and redirect to /profile", async () => {
    const { user } = await setup();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.getByText("Profile")).toBeInTheDocument());
  });

  it("should show error banner if submit fails", async () => {
    mockedServer.use(errorApiSubmitRoleRequestsHandler);
    const { user } = await setup();

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(screen.getByText("An unexpected error has occurred:")).toBeInTheDocument(),
    );
  });
});
