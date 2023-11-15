import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { OptionCard, OptionFieldset } from "@/components/Cards/OptionCard";
import { ROUTES } from "@/routes";
import { BrowserRouter } from "react-router-dom";

describe("OptionCard Component System", () => {
  describe("OptionFieldset", () => {
    beforeEach(() => {
      render(
        <OptionFieldset legend={"Test Legend"}>
          Testing rendering of children
        </OptionFieldset>
      );
    });
    test("legend prop populates legend element in fieldset", () => {
      expect(
        screen.getByRole("group", { name: "Test Legend" })
      ).toBeInTheDocument();
    });
    test("renders children", () => {
      expect(
        screen.getByText("Testing rendering of children")
      ).toBeInTheDocument();
    });
  });
  describe("OptionCard", () => {
    const renderOptionCard = (altBg: boolean) => {
      render(
        <BrowserRouter>
          <OptionCard
            linkTo={ROUTES.HOME}
            title={"Test Card Title"}
            description={"Test Card Description"}
            altBg={altBg}
          />
        </BrowserRouter>
      );
    };
    test("default background is white", () => {
      renderOptionCard(false);
      const innerWrapper = screen.getByTestId("card-inner-wrapper");
      expect(innerWrapper.className.includes("bg-white")).toBeTruthy();
      expect(innerWrapper.className.includes("bg-slate-100")).toBeFalsy();
    });
    test("option for alternate background color", () => {
      renderOptionCard(true);
      const innerWrapper = screen.getByTestId("card-inner-wrapper");
      expect(innerWrapper.className.includes("bg-slate-100")).toBeTruthy();
      expect(innerWrapper.className.includes("bg-white")).toBeFalsy();
    });
    test("title is rendered as an h2 and styled", () => {
      renderOptionCard(false);
      const header = screen.getByRole("heading", { level: 2 });
      expect(header).toHaveTextContent("Test Card Title");
      expect(header).toHaveClass("text-lg text-sky-700 font-bold my-2");
    });
    test("description is rendered", () => {
      renderOptionCard(false);
      expect(screen.getByText("Test Card Description")).toBeInTheDocument();
    });
  });
});
