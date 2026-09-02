import { fireEvent, screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
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
    const rendered = renderWithQueryClientAndMemoryRouter(
      <CMSSignup />,
      [
        {
          path: "/",
          element: <div>Home</div>,
        },
        {
          path: "/dashboard",
          element: <div>Dashboard</div>,
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
    };
  };

  const selectGroupAndDivision = async () => {
    const submitButton = screen.getByRole("button", { name: "Submit" });

    fireEvent.click(screen.getByRole("combobox", { name: /Select group/ }));
    fireEvent.click(await screen.findByText("Disabled & Elderly Health Programs Group"));
    expect(submitButton).toBeDisabled();

    fireEvent.click(await screen.findByRole("combobox", { name: /Select division/ }));
    fireEvent.click(await screen.findByText("Div of Health Homes, PACE & COB/TPL"));
    await waitFor(() => expect(submitButton).toBeEnabled());

    return submitButton;
  };

  it("should navigate to / if the user is not logged in", async () => {
    setMockUsername(null);
    await setup();

    await waitFor(() => expect(screen.getByText("Home")).toBeInTheDocument());
  });

  it("should navigate to /profile if the user is not a CMS default user or approver", async () => {
    setDefaultStateSubmitter();
    await setup();

    await waitFor(() => expect(screen.getByText("Profile")).toBeInTheDocument());
  });

  it("should show the form if the user is a defaultcmsuser", async () => {
    setMockUsername(defaultCMSUser);
    await setup();

    expect(screen.getByText("Registration: CMS Role Approver Access")).toBeInTheDocument();
  });

  it("should redirect if the user is cmsroleapprover", async () => {
    setMockUsername(cmsRoleApprover);
    await setup();
    expect(screen.getByText("Registration: CMS Read-only Access")).toBeInTheDocument();
  });

  it("should handle filling out the form", async () => {
    setMockUsername(defaultCMSUser);
    await setup();

    const submitButton = await selectGroupAndDivision();
    fireEvent.click(submitButton);

    await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
  });

  it("should show an error if there was an error submitting the request", async () => {
    mockedServer.use(errorApiSubmitRoleRequestsHandler);
    setMockUsername(defaultCMSUser);
    await setup();

    fireEvent.click(await selectGroupAndDivision());

    await waitFor(() =>
      expect(screen.getByText("Registration: CMS Role Approver Access")).toBeInTheDocument(),
    );
  });
});
