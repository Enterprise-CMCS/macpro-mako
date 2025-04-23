import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FAQContentType } from "@/features/support/SupportMockContent";

import SearchContent from "./searchSupportPage";

vi.mock("./boldSearchResults", () => ({
  generateBoldAnswerJSX: vi.fn((s, jsx) => jsx),
}));

const mockContent: FAQContentType[] = [
  {
    sectionTitle: "General",
    qanda: [
      {
        question: "What is your return policy?",
        answerJSX: <p>You can return items within 30 days.</p>,
        anchorText: "return-policy",
      },
    ],
  },
];

describe("SearchContent", () => {
  it("renders search component with placeholder", () => {
    const setSearchResults = vi.fn();
    render(
      <SearchContent
        supportContent={mockContent}
        placeholderText="Search here"
        setSearchResults={setSearchResults}
        isSearching={false}
      />,
    );

    expect(screen.getByPlaceholderText("Search here")).toBeInTheDocument();
  });

  it("returns no results if search term does not match", async () => {
    const setSearchResults = vi.fn();
    render(
      <SearchContent
        supportContent={mockContent}
        placeholderText="Search here"
        setSearchResults={setSearchResults}
        isSearching={false}
      />,
    );

    const input = screen.getByPlaceholderText("Search here");
    await userEvent.type(input, "nonexistent");

    expect(setSearchResults).toHaveBeenCalledWith(
      [{ sectionTitle: `No matches found for "nonexistent"`, qanda: [] }],
      true,
    );
  });

  it("returns formatted result when a match is found", async () => {
    const setSearchResults = vi.fn();
    render(
      <SearchContent
        supportContent={mockContent}
        placeholderText="Search here"
        setSearchResults={setSearchResults}
        isSearching={false}
      />,
    );

    const input = screen.getByPlaceholderText("Search here");
    await userEvent.type(input, "return");

    expect(setSearchResults).toHaveBeenCalledWith(
      [
        {
          sectionTitle: `Search results for "return"`,
          qanda: [
            {
              question: "What is your return policy?",
              answerJSX: <p>You can return items within 30 days.</p>,
              anchorText: "return-policy",
              sectionTitle: "General",
            },
          ],
        },
      ],
      true,
    );
  });
});
