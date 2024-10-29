import { render, screen, fireEvent } from "@testing-library/react";
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

  test("calls onPageChange when Previous button is clicked", () => {
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
    fireEvent.click(prevButton);
    expect(onPageChangeMock).toHaveBeenCalledWith(1);
  });

  test("calls onPageChange when Next button is clicked", () => {
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
    fireEvent.click(nextButton);
    expect(onPageChangeMock).toHaveBeenCalledWith(3);
  });

  test("calls onPageChange when specific page is clicked", () => {
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
    const page2Button = screen.getByRole("button", { name: "3" });
    fireEvent.click(page2Button);
    expect(onPageChangeMock).toHaveBeenCalledWith(2);
  });

  test("calls onPageChange specifc page chosen after selecting ...", () => {
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

    // const ellipseButton = screen.("button", { name: "..." });
    // fireEvent.click(ellipseButton);
    const selectElement = screen.getByTestId("morePagesButton");
    fireEvent.change(selectElement, { target: { value: "6" } });
    expect(onPageChangeMock).toHaveBeenCalledWith(5);
  });

  test("calls onSizeChange when page size is changed", () => {
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

    fireEvent.change(screen.getByRole("combobox"), { target: { value: 50 } });
    expect(onSizeChangeMock).toHaveBeenCalledWith(50);
  });
});
