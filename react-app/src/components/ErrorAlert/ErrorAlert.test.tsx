import { render, screen } from "@testing-library/react";
import { ReactQueryApiError } from "shared-types";
import { describe, expect, it } from "vitest";

import { ErrorAlert } from "./index";

describe("ErrorAlert", () => {
  it("renders with default error", () => {
    render(<ErrorAlert error={{} as ReactQueryApiError} />);

    expect(screen.queryByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("An error has occurred")).toBeInTheDocument();
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
