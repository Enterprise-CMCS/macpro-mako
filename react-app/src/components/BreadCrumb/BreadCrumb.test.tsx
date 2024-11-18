import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BreadCrumb, BreadCrumbBar, BreadCrumbs } from "./BreadCrumb";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import { optionCrumbsFromPath } from "./create-breadcrumbs";
import { Authority } from "shared-types";

export const LocationDisplay = () => {
  const location = useLocation();

  return <div data-testid="location-display">{location.pathname}</div>;
};

describe("Bread Crumb Tests", () => {
  describe("Bread Crumb Routing", () => {
    test("Sucessfully navigate using breadcrumbs", async () => {
      render(
        <>
          <Routes>
            <Route path="/" element={<p>Fail</p>} />
            <Route path="/test" element={<p>Success</p>} />
            <Route path="/test/:id" element={<p>Fail</p>} />
          </Routes>
          <BreadCrumbBar>
            <BreadCrumb to="/test">Click Me</BreadCrumb>
          </BreadCrumbBar>
          <LocationDisplay />
        </>,
        { wrapper: BrowserRouter },
      );

      const user = userEvent.setup();

      await user.click(screen.getByText(/click me/i));
      expect(screen.getByText("/test")).toBeInTheDocument();
    });
  });

  describe("Bread Crumb Interations", async () => {
    beforeEach(() => {
      render(
        <BreadCrumbBar>
          <BreadCrumb data-testid="home" to="/">
            Home
          </BreadCrumb>
          <BreadCrumb data-testid="dashboard" to="/test">
            Test Dashboard
          </BreadCrumb>
          <BreadCrumb data-testid="item" to="/test/:id" active={false}>
            Test Item
          </BreadCrumb>
        </BreadCrumbBar>,
        {
          wrapper: BrowserRouter,
        },
      );
    });

    test("active element is styled different", async () => {
      const homeBreadCrumb = screen.getByText("Home");
      const dashboardBreadCrumb = screen.getByText("Test Dashboard");
      const itemBreadCrumb = screen.getByText("Test Item");

      expect(homeBreadCrumb.classList.contains("underline")).toBeTruthy();
      expect(dashboardBreadCrumb.classList.contains("underline")).toBeTruthy();
      expect(itemBreadCrumb.classList.contains("underline")).toBeFalsy();
    });
  });

  describe("Create Bread Crumbs From Path", async () => {
    test("return the dashboard crum as the first breadcrumb", () => {
      const result = optionCrumbsFromPath("/details/package-id");

      expect(result[0].displayText).toEqual("Dashboard");
      expect(result[0].to).toEqual("/dashboard");
    });

    test("when a path is a new submission; newSubmissionPageRouteMapper is used", () => {
      const result = optionCrumbsFromPath("/new-submission/spa/medicaid/create?origin=spas");

      const medicaid = {
        to: "/new-submission/spa/medicaid",
        displayText: "Medicaid SPA Type",
      };

      expect(result.length).toBe(4); // dashboard > submission type > SPA > medicaid
      expect(result[3].to).toBe(medicaid.to);
      expect(result[3].displayText).toBe(medicaid.displayText);
    });

    test("optionCrumbsFromPath creates config passed into component & displays correct bread crumbs ", () => {
      const path = "/details/Medicaid%20SPA/MD-24-0114-P";
      const testConfig = optionCrumbsFromPath(path, "Medicaid SPA" as Authority);

      render(<BreadCrumbs options={[...testConfig]} />, { wrapper: BrowserRouter });

      const dashboardBreadCrum = screen.getByRole("link", { name: "Dashboard" });
      expect(dashboardBreadCrum).toBeInTheDocument();
      expect(dashboardBreadCrum).toHaveAttribute("href", "/dashboard?tab=spas");
    });
  });
});
