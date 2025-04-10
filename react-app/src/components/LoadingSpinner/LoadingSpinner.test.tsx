import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingSpinner } from "./index";

describe("HowItWorks", () => {
  it("renders", () => {
    render(<LoadingSpinner />);

    expect(screen.getByTestId("three-dots-loading")).toBeInTheDocument();
  });
});
