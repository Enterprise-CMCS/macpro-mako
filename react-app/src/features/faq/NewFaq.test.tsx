import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NewFaq } from "./NewFaq";
import ExpandCollapseBtn from "./content/expandCollapseBtn";

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
        { anchorText: "q3", question: "What is FAQ 3?", answerJSX: <p>Answer 3</p> },
      ],
    },
  ],
  helpDeskContact: {
    phone: "123-456-7890",
    email: "help@example.com",
  },
}));

describe("ExpandCollapseBtn", () => {
  it("should display 'Expand all' when areAllOpen is false", () => {
    render(<ExpandCollapseBtn expandAll={vi.fn()} collapseAll={vi.fn()} areAllOpen={vi.fn()} />);

    const button = screen.getByTestId("expand-all");
    expect(button).toHaveTextContent("Expand all");
  });

  it("should display 'Collapse all' when areAllOpen is true", async () => {
    render(<ExpandCollapseBtn expandAll={vi.fn()} collapseAll={vi.fn()} areAllOpen={vi.fn()} />);

    const button = screen.getByTestId("expand-all");

    button.click();
    screen.debug();
    await waitFor(async () => expect(screen.getByText("Collapse all")).toBeInTheDocument());
    expect(button).toHaveTextContent("Collapse all");
  });

  it("should call expandAll when clicked and areAllOpen is false", async () => {
    const expandAllMock = vi.fn();
    const collapseAllMock = vi.fn();
    const areAllOpenMock = vi.fn();

    render(
      <ExpandCollapseBtn
        expandAll={expandAllMock}
        collapseAll={collapseAllMock}
        areAllOpen={areAllOpenMock}
      />,
    );

    const button = screen.getByTestId("expand-all");
    button.click();
    await waitFor(async () => expect(screen.getByText("Collapse all")).toBeInTheDocument());
    expect(expandAllMock).toHaveBeenCalled();

    expect(button).toHaveTextContent("Collapse all");
  });

  it("should call collapseAll when clicked and areAllOpen is true", async () => {
    const expandAllMock = vi.fn();
    const collapseAllMock = vi.fn();
    const areAllOpenMock = vi.fn();

    render(
      <ExpandCollapseBtn
        expandAll={expandAllMock}
        collapseAll={collapseAllMock}
        areAllOpen={areAllOpenMock}
      />,
    );

    const button = screen.getByTestId("expand-all");
    // click twice to collapse all
    button.click();
    await waitFor(async () => expect(screen.getByText("Collapse all")).toBeInTheDocument());
    button.click();
    await waitFor(async () => expect(screen.getByText("Expand all")).toBeInTheDocument());

    expect(collapseAllMock).toHaveBeenCalled();

    expect(button).toHaveTextContent("Expand all");
  });
});

describe("LegacyFaq", () => {
  it("should set open items correctly when id param is passed", async () => {
    const scrollToMock = vi.fn();
    global.scrollTo = scrollToMock;

    render(<NewFaq />);

    expect(screen.getByTestId("q1")).toBeInTheDocument();
    expect(scrollToMock).toHaveBeenCalled();
    expect(scrollToMock).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: "smooth",
    });
  });
});
