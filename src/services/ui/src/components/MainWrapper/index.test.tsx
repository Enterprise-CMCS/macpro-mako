/**
 * @vitest-environment jsdom
 */

import { TestWrapper } from "../../lib/TestWrapper";
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import MainWrapper from ".";

describe("Header test", () => {
  test("should show main wrapper text", () => {
    render(
      <TestWrapper>
        <MainWrapper>
          <div>Test Children Content</div>
        </MainWrapper>
      </TestWrapper>
    );

    expect(screen.getByText(/Test Children Content/i)).toBeDefined();
  });
});
