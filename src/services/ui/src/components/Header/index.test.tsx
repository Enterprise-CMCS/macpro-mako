import { Wrapper } from "../../utils/vitest/Wrapper";
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from ".";

describe("Header test", () => {
  test("should show home text", () => {
    render(
      <Wrapper>
        <Header />
      </Wrapper>
    );

    expect(screen.getByText(/Home/i)).toBeDefined();
  });
});
