import { render } from "@testing-library/react";

// Custom render function for email templates that doesn't wrap in TestingLibrary's default containers
export const renderEmailTemplate = (ui: React.ReactElement) => {
  return render(ui, {
    container: document.createElement("div"),
    // Don't append to document.body which adds extra wrappers
    baseElement: document.createElement("div"),
  });
};
