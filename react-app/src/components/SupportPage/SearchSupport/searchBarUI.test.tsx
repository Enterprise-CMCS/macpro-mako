import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Search from "./searchBarUI";

describe("Search Component", () => {
  const handleSearchMock = vi.fn();

  beforeEach(() => {
    handleSearchMock.mockClear();
  });

  it("should update the search input value when typed into", () => {
    render(
      <Search handleSearch={handleSearchMock} placeholderText="Search..." isSearching={true} />,
    );

    const input = screen.getByPlaceholderText("Search...");

    fireEvent.change(input, { target: { value: "test search" } });

    expect(input).toHaveValue("test search");
  });

  it("should call handleSearch with the correct value when the search button is clicked", async () => {
    render(
      <Search handleSearch={handleSearchMock} placeholderText="Search..." isSearching={true} />,
    );

    const input = screen.getByPlaceholderText("Search...");
    const button = screen.getByRole("button", { name: /search/i });

    fireEvent.change(input, { target: { value: "test search" } });

    await waitFor(async () => {
      fireEvent.click(button);
    });

    expect(handleSearchMock).toHaveBeenCalledWith("test search");
  });

  it("should clear the input and call handleSearch with an empty string when the close icon is clicked", () => {
    render(
      <Search handleSearch={handleSearchMock} placeholderText="Search..." isSearching={true} />,
    );

    const input = screen.getByPlaceholderText("Search...");
    const closeIcon = screen.getByTestId("close-icon");

    fireEvent.change(input, { target: { value: "test search" } });

    expect(input).toHaveValue("test search");

    fireEvent.click(closeIcon);

    expect(input).toHaveValue("");

    expect(handleSearchMock).toHaveBeenCalledWith("");
  });
});
