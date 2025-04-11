import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Faq } from "./Faq";

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

describe("Faq", () => {
  it("should expand all FAQ items when the 'Expand all' button is clicked", () => {
    render(<Faq />);

    const expandButton = screen.getByTestId("expand-all");

    expect(screen.queryByText("Answer 2")).toBeNull();
    fireEvent.click(expandButton);
    expect(screen.getByText("Answer 2")).toBeInTheDocument();
  });

  it("should set open items correctly when id param is passed", async () => {
    const scrollToMock = vi.fn();
    global.scrollTo = scrollToMock;

    render(<Faq />);

    expect(screen.getByTestId("q1")).toBeInTheDocument();
    expect(scrollToMock).toHaveBeenCalled();
    expect(scrollToMock).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: "smooth",
    });
  });

  it("should display the items expected", async () => {
    const scrollToMock = vi.fn();
    global.scrollTo = scrollToMock;

    const { asFragment } = render(<Faq />);

    expect(asFragment()).toMatchSnapshot();
  });
});
