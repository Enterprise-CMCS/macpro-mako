import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { FAQFooter } from "./FAQFooter";

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
