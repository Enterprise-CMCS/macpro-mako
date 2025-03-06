import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LegacyFaq } from "./LegacyFaq";

vi.mock("react-router", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("react-router")),
  useParams: vi.fn().mockReturnValue({ id: "q1" }),
}));

vi.mock("./content/oneMACFAQContent", () => ({
  oneMACFAQContent: [
    {
      sectionTitle: "Section 1",
      qanda: [
        { anchorText: "q1", question: "What is FAQ 1?", answerJSX: <p>Answer 1</p> },
        { anchorText: "q2", question: "What is FAQ 2?", answerJSX: <p>Answer 2</p> },
      ],
    },
  ],
  helpDeskContact: {
    phone: "123-456-7890",
    email: "help@example.com",
  },
}));

describe("LegacyFaq", () => {
  it("should expand all FAQ items when the 'Expand all' button is clicked", () => {
    render(<LegacyFaq flagValue={null} />);

    const expandButton = screen.getByTestId("expand-all");

    expect(screen.queryByText("Answer 2")).toBeNull();
    fireEvent.click(expandButton);
    expect(screen.getByText("Answer 2")).toBeInTheDocument();
  });

  it("should set open items correctly when id param is passed", async () => {
    const scrollToMock = vi.fn();
    global.scrollTo = scrollToMock;

    render(<LegacyFaq flagValue={null} />);

    expect(screen.getByTestId("q1")).toBeInTheDocument();
    expect(scrollToMock).toHaveBeenCalled();
    expect(scrollToMock).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: "smooth",
    });
  });
});
