import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SimplePageContainer } from "./SimplePageContainer";

describe("SimplePageContainer", () => {
  it("renders children inside the container", () => {
    render(
      <SimplePageContainer>
        <p>Example content</p>
      </SimplePageContainer>,
    );

    expect(screen.getByText("Example content")).toBeInTheDocument();
  });
});
