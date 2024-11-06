import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { ErrorAlert } from "./index";
import { ReactQueryApiError } from "shared-types";

describe("ErrorAlert", () => {
  it("renders with default error", () => {
    render(<ErrorAlert error={{} as ReactQueryApiError} />);

    expect(screen.queryByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("An error has occured")).toBeInTheDocument();
  });

  it("renders with error message", () => {
    render(
      <ErrorAlert
        error={
          {
            response: { data: { message: "test error message" } },
          } as ReactQueryApiError
        }
      />,
    );

    expect(screen.queryByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("test error message")).toBeInTheDocument();
  });
});
