// Search.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, afterEach } from "vitest";
import { SearchForm } from ".";
import userEvent from "@testing-library/user-event";

const mockHandleSearch = vi.fn();

describe("Search Component", () => {
  afterEach(() => {
    mockHandleSearch.mockClear();
  });

  test("renders input and svg", () => {
    render(<SearchForm handleSearch={mockHandleSearch} isSearching={false} disabled={false} />);

    expect(
      screen.getByLabelText("Search by Package ID, CPOC Name, or Submitter Name"),
    ).toBeInTheDocument();
  });

  test("can type in input field", () => {
    render(<SearchForm handleSearch={mockHandleSearch} isSearching={false} disabled={false} />);

    const input = screen.getByLabelText("Search by Package ID, CPOC Name, or Submitter Name");
    fireEvent.change(input, { target: { value: "Test query" } });

    expect(input).toHaveValue("Test query");
  });

  test("calls handleSearch onChange", async () => {
    render(<SearchForm handleSearch={mockHandleSearch} isSearching={false} disabled={false} />);

    const input = screen.getByLabelText("Search by Package ID, CPOC Name, or Submitter Name");

    fireEvent.change(input, { target: { value: "Test query" } });

    await waitFor(() => {
      expect(mockHandleSearch).toHaveBeenCalledWith("Test query");
    });
  });

  test("calls handleSearch onSubmit", async () => {
    render(<SearchForm handleSearch={mockHandleSearch} isSearching={false} disabled={false} />);

    const input = screen.getByLabelText("Search by Package ID, CPOC Name, or Submitter Name");

    fireEvent.change(input, { target: { value: "Test query" } });
    // this triggers the user clicking the 'enter' key
    userEvent.type(input, "{enter}");

    await waitFor(() => {
      expect(mockHandleSearch).toHaveBeenCalledWith("Test query");
    });
  });

  test("x button appears after text is inputed", () => {
    render(<SearchForm handleSearch={mockHandleSearch} isSearching={false} disabled={false} />);

    const input = screen.getByLabelText("Search by Package ID, CPOC Name, or Submitter Name");
    fireEvent.change(input, { target: { value: "Test query" } });

    const xButton = screen.getByTestId("close-icon");
    expect(xButton).toBeInTheDocument();
  });

  test("clicking x clears the text input", async () => {
    render(<SearchForm handleSearch={mockHandleSearch} isSearching={false} disabled={false} />);
    const input = screen.getByLabelText("Search by Package ID, CPOC Name, or Submitter Name");
    fireEvent.change(input, { target: { value: "Test query" } });

    const xButton = screen.getByTestId("close-icon");
    expect(xButton).toBeInTheDocument();

    fireEvent.click(xButton);

    await waitFor(() => {
      expect(input).toHaveValue("");
      expect(mockHandleSearch).toHaveBeenCalledWith("");
    });
  });
});
