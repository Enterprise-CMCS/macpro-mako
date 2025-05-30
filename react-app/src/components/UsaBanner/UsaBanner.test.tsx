import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { UsaBanner } from ".";

vi.mock("react-router", () => ({
  useLoaderData: vi.fn().mockImplementation(() => ({ error: "" })),
}));

describe("UsaBanner", () => {
  test("clicking on button expands banner information (small)", async () => {
    const { queryAllByRole, queryByText } = render(<UsaBanner isUserMissingRole={false} />);

    const button = queryAllByRole("button")[0];
    await userEvent.click(button);

    expect(queryByText("Official websites use .gov")).toBeInTheDocument();
  });

  test("clicking on button expands banner information (large)", async () => {
    const { queryAllByRole, queryByText } = render(<UsaBanner isUserMissingRole={false} />);

    const button = queryAllByRole("button")[1];
    await userEvent.click(button);

    expect(queryByText("Official websites use .gov")).toBeInTheDocument();
  });

  test("isUserMissingRole={true} renders the warning banner", () => {
    const { queryByText } = render(<UsaBanner isUserMissingRole={true} />);

    expect(
      queryByText(/You do not have access to view the entire application./),
    ).toBeInTheDocument();
  });

  test("isUserMissingRole={false} doesn't render the warning banner", () => {
    const { queryByText } = render(<UsaBanner isUserMissingRole={false} />);

    expect(
      queryByText(/You do not have access to view the entire application/),
    ).not.toBeInTheDocument();
  });

  test("government building icon renders", async () => {
    const { queryByTestId, queryAllByRole } = render(<UsaBanner isUserMissingRole={true} />);

    const button = queryAllByRole("button")[0];
    await userEvent.click(button);

    expect(queryByTestId("gov-build-icon")).toBeInTheDocument();
  });
});
