import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  cmsRoleApprover,
  defaultCMSUser,
  errorApiSubmitRoleRequestsHandler,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { CMSSignup } from "./cmsSignup";

describe("CMSSignup", () => {
  const setup = async () => {
    const user = userEvent.setup();
    const rendered = renderWithQueryClientAndMemoryRouter(
      <CMSSignup />,
      [
        {
          path: "/",
          element: <div>Home</div>,
        },
        {
          path: "/profile",
          element: <div>Profile</div>,
        },
        {
          path: "/signup",
          element: <div>Signup</div>,
        },
        {
          path: "/signup/cms",
          element: <CMSSignup />,
        },
      ],
      {
        initialEntries: [
          {
            pathname: "/signup/cms",
          },
        ],
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

  it("should navigate to / if the user is not logged in", async () => {
    setMockUsername(null);
    await setup();

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("should navigate to /profile if the user is not a CMS default user or approver", async () => {
    setDefaultStateSubmitter();
    await setup();

    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("should show the form if the user is a defaultcmsuser", async () => {
    setMockUsername(defaultCMSUser);
    await setup();

    expect(screen.getByText("Registration: CMS Reviewer Access")).toBeInTheDocument();
  });

  it("should show the form if the user is a cmsroleapprover", async () => {
    setMockUsername(cmsRoleApprover);
    await setup();

    expect(screen.getByText("Registration: CMS Reviewer Access")).toBeInTheDocument();
  });

  it("should handle filling out the form", async () => {
    setMockUsername(cmsRoleApprover);
    const { user } = await setup();

    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole("combobox", { name: /Select group/ }));
    expect(submitButton).toBeDisabled();

    await waitFor(() =>
      expect(screen.getByText("Disabled & Elderly Health Programs Group")).toBeInTheDocument(),
    );
    await user.click(screen.getByText("Disabled & Elderly Health Programs Group"));
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole("combobox", { name: /Select division/ }));
    expect(submitButton).toBeDisabled();

    await waitFor(() => expect(screen.getByText("Div of Managed Care Policy")).toBeInTheDocument());
    await user.click(screen.getByText("Div of Managed Care Policy"));
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    await waitFor(() => expect(screen.getByText("Home")).toBeInTheDocument());
  });

  it("should show an error if there was an error submitting the request", async () => {
    mockedServer.use(errorApiSubmitRoleRequestsHandler);
    setMockUsername(cmsRoleApprover);
    const { user } = await setup();

    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole("combobox", { name: /Select group/ }));
    expect(submitButton).toBeDisabled();

    await waitFor(() =>
      expect(screen.getByText("Disabled & Elderly Health Programs Group")).toBeInTheDocument(),
    );
    await user.click(screen.getByText("Disabled & Elderly Health Programs Group"));
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole("combobox", { name: /Select division/ }));
    expect(submitButton).toBeDisabled();

    await waitFor(() => expect(screen.getByText("Div of Managed Care Policy")).toBeInTheDocument());
    await user.click(screen.getByText("Div of Managed Care Policy"));
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    expect(screen.getByText("Registration: CMS Reviewer Access")).toBeInTheDocument();
  });
});
