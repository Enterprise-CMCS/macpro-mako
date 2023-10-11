import { describe, test, expect, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BreadCrumb, BreadCrumbBar } from "./BreadCrumb";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

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
            <Route path="/" />
            <Route path="/test" />
            <Route path="/test/:id" />
          </Routes>
          <BreadCrumbBar>
            <BreadCrumb to="/test">Click Me</BreadCrumb>
          </BreadCrumbBar>
          <LocationDisplay />
        </>,
        { wrapper: BrowserRouter }
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
        }
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

  // TODO: Write a test to test the functionality of the BreadCrumbs component with a test config passed in
});
