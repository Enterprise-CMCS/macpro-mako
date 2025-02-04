import { render } from "@testing-library/react";
import { ReactElement } from "react";

/**
 * Custom render function for email templates that prevents DOM nesting warnings
 * by using a more appropriate container element and suppressing specific warnings
 */
export const renderEmailTemplate = (ui: ReactElement) => {
  // Temporarily suppress validateDOMNesting warnings
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (args[0]?.includes?.("validateDOMNesting")) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Create a container that's appropriate for email content
  const container = document.createElement("div");
  container.setAttribute("data-testid", "email-template-root");

  // Render the component
  const result = render(ui, {
    container,
    // Don't append to document.body to avoid extra wrappers
    baseElement: container,
  });

  // Restore original console.error
  console.error = originalConsoleError;

  return result;
};
