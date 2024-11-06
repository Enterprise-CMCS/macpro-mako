import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { LoadingSpinner } from "./index";

describe("HowItWorks", () => {
  it("renders", () => {
    render(<LoadingSpinner />);

    expect(screen.getByTestId("three-dots-loading")).toBeInTheDocument();
  });
});
