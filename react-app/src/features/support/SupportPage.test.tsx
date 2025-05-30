import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SupportPage } from "./SupportPage";

vi.mock("react-router", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("react-router")),
  useParams: vi.fn().mockReturnValue({ id: "q1-support" }),
  Navigate: vi.fn(),
  useNavigate: vi.fn().mockReturnValue(vi.fn()),
}));

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: vi.fn().mockReturnValue(true),
}));

vi.mock("shared-utils", () => ({
  isCmsUser: vi.fn().mockReturnValue(false),
}));

vi.mock("./SupportMockContent", () => ({
  oneMACStateFAQContent: [
    {
      sectionTitle: "Section 1",
      qanda: [
        { anchorText: "q1", question: "What is FAQ 1?", answerJSX: <p>Answer 1</p> },
        { anchorText: "q2", question: "What is FAQ 2?", answerJSX: <p>Answer 2</p> },
        { anchorText: "q3", question: "What is FAQ 3?", answerJSX: <p>Answer 3</p> },
      ],
    },
  ],
  oneMACCMSContent: [
    {
      sectionTitle: "CMS Section 1",
      qanda: [
        { anchorText: "q1", question: "What is CMS FAQ 1?", answerJSX: <p>Answer 1</p> },
        { anchorText: "q2", question: "What is CMS FAQ 2?", answerJSX: <p>Answer 2</p> },
        { anchorText: "q3", question: "What is CMS FAQ 3?", answerJSX: <p>Answer 3</p> },
      ],
    },
  ],
  helpDeskContact: {
    phone: "123-456-7890",
    email: "help@example.com",
  },
}));

vi.mock("@/api/useGetUser", () => ({
  useGetUser: vi.fn().mockReturnValue({ data: { user: true } }),
}));

describe("OneMAC Support", () => {
  it("should set open items correctly when id param is passed", async () => {
    const scrollToMock = vi.fn();
    global.scrollTo = scrollToMock;

    render(<SupportPage />);

    expect(screen.getByTestId("q1-support")).toBeInTheDocument();
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

  it("should display the Toggle group if the user is CMS", () => {
    vi.mock("shared-utils", () => ({
      isCmsUser: vi.fn().mockReturnValue(true),
    }));
    render(<SupportPage />);

    expect(screen.getByTestId("cms-toggle-group")).toBeInTheDocument();
  });

  it("should show search results and update state when a match is found", async () => {
    render(<SupportPage />);

    const input = screen.getByPlaceholderText("Search OneMAC support");
    const button = screen.getByRole("button", { name: /Search/i });

    await userEvent.type(input, "CMS FAQ 2");
    await userEvent.click(button);

    expect(screen.getByText("Search Results")).toBeInTheDocument();

    expect(screen.getByText("Answer 2")).toBeInTheDocument();
  });

  it("should display the LeftNavigation when not searching", () => {
    render(<SupportPage />);

    expect(screen.getByTestId("support-left-nav")).toBeInTheDocument();
  });

  it("should reset search state when browser back button is pressed", async () => {
    render(<SupportPage />);

    await userEvent.type(screen.getByPlaceholderText("Search OneMAC support"), "FAQ 3");
    await userEvent.click(screen.getByRole("button", { name: /Search/i }));

    await waitFor(() => {
      expect(screen.getByText("Search Results")).toBeInTheDocument();
    });

    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitFor(() => {
      expect(screen.queryByText("Search Results")).not.toBeInTheDocument();
    });
  });
});
