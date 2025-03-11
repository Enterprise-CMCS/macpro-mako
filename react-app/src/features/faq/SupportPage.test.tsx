import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SupportPage } from "./SupportPage";
import ExpandCollapseBtn from "../../components/SupportPage/expandCollapseBtn";

vi.mock("react-router", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("react-router")),
  useParams: vi.fn().mockReturnValue({ id: "q1" }),
}));

vi.mock("./content/SupportMockContent", () => ({
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
    render(<ExpandCollapseBtn expandAll={vi.fn()} collapseAll={vi.fn()} areAllOpen={false} />);

    const button = screen.getByTestId("expand-all");
    expect(button).toHaveTextContent("Expand all");
  });

  it("should display 'Collapse all' when areAllOpen is true", async () => {
    render(<ExpandCollapseBtn expandAll={vi.fn()} collapseAll={vi.fn()} areAllOpen={true} />);

    const button = screen.getByTestId("expand-all");

    button.click();
    screen.debug();
    await waitFor(async () => expect(screen.getByText("Collapse all")).toBeInTheDocument());
    expect(button).toHaveTextContent("Collapse all");
  });
});

describe("OneMAC Support", () => {
  it("should set open items correctly when id param is passed", async () => {
    const scrollToMock = vi.fn();
    global.scrollTo = scrollToMock;

    render(<SupportPage />);

    expect(screen.getByTestId("q1")).toBeInTheDocument();
    expect(scrollToMock).toHaveBeenCalled();
    expect(scrollToMock).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: "smooth",
    });
  });

  it("should calculate if all accordions are open correctly when expanded", async () => {
    render(<SupportPage />);

    const expandAllButton = screen.getByTestId("expand-all");

    expect(screen.queryByText("Answer 2")).toBeNull();
    expect(screen.queryByText("Answer 3")).toBeNull();

    expandAllButton.click();

    await waitFor(async () => expect(screen.getByText("Collapse all")).toBeInTheDocument());
    expect(screen.getByText("Answer 2")).toBeInTheDocument();
    expect(screen.getByText("Answer 3")).toBeInTheDocument();
    expect(screen.getByTestId("expand-all")).toHaveTextContent("Collapse all");
  });

  it("should calculate if all accordions are collapsed correctly", async () => {
    render(<SupportPage />);

    const expandAllButton = screen.getByTestId("expand-all");
    expect(screen.queryByText("Answer 2")).toBeNull();
    expect(screen.queryByText("Answer 3")).toBeNull();

    expandAllButton.click();
    await waitFor(async () => expect(screen.getByText("Collapse all")).toBeInTheDocument());
    expandAllButton.click();
    await waitFor(async () => expect(screen.getByText("Expand all")).toBeInTheDocument());

    expect(screen.queryByText("Answer 2")).toBeNull();
    expect(screen.queryByText("Answer 3")).toBeNull();

    expect(screen.getByTestId("expand-all")).toHaveTextContent("Expand all");
  });
});
