import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import { makoReviewer, setDefaultStateSubmitter, setMockUsername } from "mocks";
import React, { ReactElement } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import {
  B4WaiverSubmissionOptions,
  BCapWaiverSubmissionOptions,
  BWaiverSubmissionOptions,
  ChipSPASubmissionOptions,
  MedicaidSPASubmissionOptions,
  NewSubmissionInitialOptions,
  SimplePageTitle,
  SPASubmissionOptions,
  WaiverSubmissionOptions,
} from "./plan-types";

const setup = async (element: ReactElement, path: string) => {
  const rendered = renderWithQueryClientAndMemoryRouter(
    element,
    [
      {
        path: "/",
        element: <div>Home</div>,
      },
      {
        path,
        element,
      },
    ],
    {
      initialEntries: [
        {
          pathname: path,
        },
      ],
    },
  );
  if (screen.queryAllByLabelText("three-dots-loading")?.length > 0) {
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText("three-dots-loading"));
  }
  return rendered;
};

describe("plan-types", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
  });

  describe("SimplePageTitle", () => {
    it("should render the page", () => {
      const { asFragment } = render(<SimplePageTitle title="Test" />);

      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe("NewSubmissionInitialOptions", () => {
    it("should navigate unauthenticated users to /", async () => {
      setMockUsername(null);
      await setup(<NewSubmissionInitialOptions />, "/new-submission");
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("should navigate cms users to /", async () => {
      setMockUsername(makoReviewer);
      await setup(<NewSubmissionInitialOptions />, "/new-submission");
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("should render the page for a state user", async () => {
      await setup(<NewSubmissionInitialOptions />, "/new-submission");
      expect(screen.getByRole("heading", { name: "Submission Type" })).toBeInTheDocument();
    });
  });

  describe("SPASubmissionOptions", () => {
    it("should render the page for a state user", async () => {
      await setup(<SPASubmissionOptions />, "/new-submission/spa");
      expect(screen.getByRole("heading", { name: "SPA Type" })).toBeInTheDocument();
    });
  });

  describe("MedicaidSPASubmissionOptions", () => {
    it("should render the page for a state user", async () => {
      await setup(<MedicaidSPASubmissionOptions />, "/new-submission/spa/medicaid");
      expect(screen.getByRole("heading", { name: "Medicaid SPA Type" })).toBeInTheDocument();
    });
  });

  describe("ChipSPASubmissionOptions", () => {
    it("should render the page for a state user", async () => {
      await setup(<ChipSPASubmissionOptions />, "/new-submission/spa/chip");
      expect(screen.getByRole("heading", { name: "CHIP SPA Type" })).toBeInTheDocument();
    });
  });

  describe("WaiverSubmissionOptions", () => {
    it("should render the page for a state user", async () => {
      await setup(<WaiverSubmissionOptions />, "/new-submission/waiver");
      expect(screen.getByRole("heading", { name: "Waiver Action Type" })).toBeInTheDocument();
    });
  });

  describe("BWaiverSubmissionOptions", () => {
    it("should render the page for a state user", async () => {
      await setup(<BWaiverSubmissionOptions />, "/new-submission/waiver/b");
      expect(
        screen.getByRole("heading", { name: "1915(b) Waiver Action Type" }),
      ).toBeInTheDocument();
    });
  });

  describe("B4WaiverSubmissionOptions", () => {
    it("should render the page for a state user", async () => {
      await setup(<B4WaiverSubmissionOptions />, "/new-submission/waiver/b/b4");
      expect(
        screen.getByRole("heading", {
          name: "1915(b)(4) FFS Selective Contracting Waiver Authority",
        }),
      ).toBeInTheDocument();
    });
  });

  describe("BCapWaiverSubmissionOptions", () => {
    it("should render the page for a state user", async () => {
      await setup(<BCapWaiverSubmissionOptions />, "/new-submission/waiver/b/capitated");
      expect(
        screen.getByRole("heading", { name: "1915(b) Comprehensive (Capitated) Waiver Authority" }),
      ).toBeInTheDocument();
    });
  });
});
