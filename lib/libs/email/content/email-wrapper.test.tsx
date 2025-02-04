import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmailWrapper } from "./email-wrapper";

describe("EmailWrapper", () => {
  const mockPreviewText = "Test Preview";
  const mockChildren = <div>Test Content</div>;

  describe("in test environment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "test";
    });

    it("renders children in a div wrapper", () => {
      const { getByTestId } = render(
        <EmailWrapper previewText={mockPreviewText}>{mockChildren}</EmailWrapper>,
      );

      const wrapper = getByTestId("email-wrapper");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper.tagName).toBe("DIV");
      expect(wrapper).toHaveTextContent("Test Content");
    });
  });

  describe("in production environment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
    });

    it("renders full email structure", () => {
      const { container } = render(
        <EmailWrapper previewText={mockPreviewText}>{mockChildren}</EmailWrapper>,
      );

      expect(container.innerHTML).toContain("Test Content");
      expect(container.innerHTML).toContain("Test Preview");
    });
  });
});
