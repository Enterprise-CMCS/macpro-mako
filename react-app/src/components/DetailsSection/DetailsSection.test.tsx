import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DetailsSection } from "./index";

describe("DetailsSection", () => {
  it("renders with description", () => {
    render(
      <DetailsSection id="test" title="test title" description="test description">
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
