import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FAQContentType } from "@/features/support/SupportMockContent";

import SearchContent from "./searchSupportPage";

vi.mock("./boldSearchResults", () => ({
  generateBoldAnswerJSX: vi.fn((s, jsx) => jsx),
}));
vi.mock("fuse.js", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      search: vi.fn((s) => {
        if (s === "browser")
          return [
            {
              item: {
                question: "Support Browsers",
                answer: "Chrome, Firefox, and Edge.",
                anchorText: "supported-browsers",
              },
              matches: [],
              refIndex: 7,
            },
          ];

        return [];
      }),
    })),
  };
});

const mockContent: FAQContentType[] = [
  {
    sectionTitle: "General",
    qanda: [
      {
        question: "Support Browsers",
        answerJSX: <p>Chrome, Firefox, and Edge.</p>,
        anchorText: "supported-browsers",
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
    const button = screen.getByRole("button");
    screen.debug();
    await userEvent.click(button);

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
    await userEvent.type(input, "browser");
    const button = screen.getByRole("button");
    await userEvent.click(button);

    expect(setSearchResults).toHaveBeenCalledWith(
      [
        {
          sectionTitle: `Search results for "browser"`,
          qanda: [
            {
              question: "Support Browsers",
              answerJSX: <p>Chrome, Firefox, and Edge.</p>,
              anchorText: "supported-browsers",
              sectionTitle: "General",
            },
          ],
        },
      ],
      true,
    );
  });
});
