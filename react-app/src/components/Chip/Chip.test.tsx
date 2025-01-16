import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Chip } from ".";

describe("Chip", () => {
  test("onChipClick is called", async () => {
    const mockedOnChipClick = vi.fn();

    const { container } = render(<Chip onChipClick={mockedOnChipClick} />);

    const chipButton = container.getElementsByClassName("h-8 py-2 cursor-pointer")[0];

    await userEvent.click(chipButton);

    expect(mockedOnChipClick).toHaveBeenCalled();
  });

  test("onIconClick is called", async () => {
    const mockedOnIconClick = vi.fn();

    const { getByRole } = render(<Chip onIconClick={mockedOnIconClick} />);

    const chipButton = getByRole("button");

    await userEvent.click(chipButton);

    expect(mockedOnIconClick).toHaveBeenCalled();
  });

  test("noIcon or destructive variants do not render an icon", () => {
    const { queryByRole, rerender } = render(<Chip variant="destructive" />);

    expect(queryByRole("button")).not.toBeInTheDocument();

    rerender(<Chip variant="noIcon" />);

    expect(queryByRole("button")).not.toBeInTheDocument();
  });
});
