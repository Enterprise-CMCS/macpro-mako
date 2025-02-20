import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Pagination } from ".";

describe("Pagination", () => {
  test("given more than 10000 records, max count will still read of 10000 records", () => {
    render(
      <Pagination
        count={20000}
        pageNumber={0}
        pageSize={25}
        onPageChange={vi.fn()}
        onSizeChange={vi.fn()}
      />,
    );

    const maxCount = screen.getByText(/10000/i);
    expect(maxCount).toBeInTheDocument();
  });

  test("shows the expected buttons for page buttons <= 4", () => {
    render(
      <Pagination
        count={1000}
        pageNumber={2}
        pageSize={25}
        onPageChange={vi.fn()}
        onSizeChange={vi.fn()}
      />,
    );

    const paginationButtons = screen.getByLabelText("Pagination");
    expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toHaveClass(
      "focus-visible:outline-indigo-600",
    );
    expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "40" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(within(paginationButtons).getAllByRole("button").length).toEqual(8);
  });

  test("shows the expected buttons for page buttons > 4", () => {
    render(
      <Pagination
        count={1000}
        pageNumber={6}
        pageSize={25}
        onPageChange={vi.fn()}
        onSizeChange={vi.fn()}
      />,
    );

    const paginationButtons = screen.getByLabelText("Pagination");
    expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "6" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "7" })).toHaveClass(
      "focus-visible:outline-indigo-600",
    );
    expect(screen.getByRole("button", { name: "8" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "40" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(within(paginationButtons).getAllByRole("button").length).toEqual(7);
  });

  test("disables the Previous button on the first page", () => {
    render(
      <Pagination
        count={100}
        pageNumber={0}
        pageSize={25}
        onPageChange={vi.fn()}
        onSizeChange={vi.fn()}
      />,
    );

    const prevButton = screen.getByRole("button", { name: "Previous" });
    expect(prevButton).toBeDisabled();
  });

  test("disables the Next button on the last page", () => {
    render(
      <Pagination
        count={100}
        pageNumber={3}
        pageSize={25}
        onPageChange={vi.fn()}
        onSizeChange={vi.fn()}
      />,
    );

    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton).toBeDisabled();
  });

  test("calls onPageChange when Previous button is clicked", async () => {
    const user = userEvent.setup();
    const onPageChangeMock = vi.fn();
    render(
      <Pagination
        count={100}
        pageNumber={2}
        pageSize={25}
        onPageChange={onPageChangeMock}
        onSizeChange={vi.fn()}
      />,
    );

    const prevButton = screen.getByRole("button", { name: "Previous" });
    await user.click(prevButton);
    expect(onPageChangeMock).toHaveBeenCalledWith(1);
  });

  test("calls onPageChange when Next button is clicked", async () => {
    const user = userEvent.setup();
    const onPageChangeMock = vi.fn();
    render(
      <Pagination
        count={100}
        pageNumber={2}
        pageSize={25}
        onPageChange={onPageChangeMock}
        onSizeChange={vi.fn()}
      />,
    );

    const nextButton = screen.getByRole("button", { name: "Next" });
    await user.click(nextButton);
    expect(onPageChangeMock).toHaveBeenCalledWith(3);
  });

  test("calls onPageChange when specific page is clicked", async () => {
    const user = userEvent.setup();
    const onPageChangeMock = vi.fn();
    render(
      <Pagination
        count={100}
        pageNumber={1}
        pageSize={25}
        onPageChange={onPageChangeMock}
        onSizeChange={vi.fn()}
      />,
    );

    // on UI says page 3, but code is index at 0
    const page3Button = screen.getByRole("button", { name: "3" });
    await user.click(page3Button);
    expect(onPageChangeMock).toHaveBeenCalledWith(2);
  });

  test("calls onPageChange specific page chosen after selecting ...", async () => {
    const user = userEvent.setup();
    const onPageChangeMock = vi.fn();
    render(
      <Pagination
        count={300}
        pageNumber={0}
        pageSize={25}
        onPageChange={onPageChangeMock}
        onSizeChange={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByTestId("morePagesButton"), ["6"]);
    expect(onPageChangeMock).toHaveBeenCalledWith(5);
  });

  test("calls onSizeChange when page size is changed", async () => {
    const user = userEvent.setup();
    const onSizeChangeMock = vi.fn();
    render(
      <Pagination
        count={100}
        pageNumber={1}
        pageSize={25}
        onPageChange={vi.fn()}
        onSizeChange={onSizeChangeMock}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Records per page:"), ["50"]);
    expect(onSizeChangeMock).toHaveBeenCalledWith(50);
  });
});
