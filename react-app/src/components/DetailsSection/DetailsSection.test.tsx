import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { DetailsSection } from "./index";

describe("DetailsSection", () => {
  it("renders with descrription", () => {
    render(
      <DetailsSection
        id="test"
        title="test title"
        description="test description"
      >
        <p>test child</p>
      </DetailsSection>,
    );

    expect(screen.queryByText("test title")).toBeInTheDocument();
    expect(screen.queryByText("test child")).toBeInTheDocument();
    expect(screen.queryByText("test description")).toBeInTheDocument();
  });

  it("renders without description", () => {
    render(
      <DetailsSection id="test" title="test title">
        <p>test child</p>
      </DetailsSection>,
    );

    expect(screen.queryByText("test title")).toBeInTheDocument();
    expect(screen.queryByText("test child")).toBeInTheDocument();
    expect(screen.queryByText("test description")).not.toBeInTheDocument();
  });
});
