import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { Footer, FAQFooter } from "./index";

describe("Footer", () => {
  it("renders footer", () => {
    render(
      <Footer
        email="testEmail@email.com"
        address={{
          city: "testCity",
          state: "testState",
          street: "testStreet",
          zip: 1234,
        }}
      />,
    );

    expect(screen.queryByText("testEmail@email.com")).toBeInTheDocument();
    // expect(screen.queryByText("testState")).toBeInTheDocument();
    expect(screen.queryByText("testCity, testState 1234")).toBeInTheDocument();
    // expect(screen.queryByText("testStreet")).toBeInTheDocument();
    // expect(screen.queryByText("1234")).toBeInTheDocument();
  });
});

describe("FAQFooter", () => {
  it("renders faqfooter", () => {
    render(
      <BrowserRouter>
        <FAQFooter />
      </BrowserRouter>,
    );

    expect(screen.queryByText("View FAQ")).toBeInTheDocument();
    expect(
      screen.queryByText("Do you have questions or need support?"),
    ).toBeInTheDocument();
  });
});
