import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BaseEmailTemplate } from "./email-templates";

describe("BaseEmailTemplate", () => {
  const mockProps = {
    previewText: "Test Preview",
    heading: "Test Heading",
    children: <div>Test Content</div>,
    footerContent: <div>Test Footer</div>,
    applicationEndpointUrl: "http://test.com",
  };

  it("renders with all props", () => {
    const { getByTestId, getByText } = render(<BaseEmailTemplate {...mockProps} />);

    // In test environment, should be wrapped in email-wrapper
    const wrapper = getByTestId("email-wrapper");
    expect(wrapper).toBeInTheDocument();

    // Check if content is rendered
    expect(getByText("Test Heading")).toBeInTheDocument();
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(getByText("Test Footer")).toBeInTheDocument();
    expect(getByText("Thank you.")).toBeInTheDocument();
  });

  it("renders without optional props", () => {
    const { getByTestId, getByText, queryByText } = render(
      <BaseEmailTemplate
        previewText={mockProps.previewText}
        heading={mockProps.heading}
        applicationEndpointUrl={mockProps.applicationEndpointUrl}
      />,
    );

    // In test environment, should be wrapped in email-wrapper
    const wrapper = getByTestId("email-wrapper");
    expect(wrapper).toBeInTheDocument();

    // Check if required content is rendered
    expect(getByText("Test Heading")).toBeInTheDocument();
    expect(getByText("Thank you.")).toBeInTheDocument();

    // Check that optional content is not rendered
    expect(queryByText("Test Content")).not.toBeInTheDocument();
    expect(queryByText("Test Footer")).not.toBeInTheDocument();
  });
});
