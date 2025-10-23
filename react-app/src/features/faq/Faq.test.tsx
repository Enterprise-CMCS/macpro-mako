import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

import { Faq } from "./Faq";
vi.mock("react-router", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("react-router")),
  useParams: vi.fn().mockReturnValue({ id: "q1" }),
}));
vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));
vi.mock("./faqs", () => ({
  oneMACFAQContent: [
    {
      sectionTitle: "Section 1",
      qanda: [
        { anchorText: "q1", question: "What is FAQ 1?", answerJSX: <p>Answer 1</p> },
        { anchorText: "q2", question: "What is FAQ 2?", answerJSX: <p>Answer 2</p> },
      ],
    },
  ],
}));

it("should expand all FAQ items when the 'Expand all' button is clicked and send GA event", () => {
  render(<Faq />);

  const expandButton = screen.getByTestId("expand-all");

  expect(screen.queryByText("Answer 2")).toBeNull();

  fireEvent.click(expandButton);

  expect(screen.getByText("Answer 2")).toBeInTheDocument();

  // GA event called
  expect(sendGAEvent).toHaveBeenCalledWith("support_click_general_expand-all", {
    event_category: "Support",
    event_label: "Expand All",
  });
});

it("should fire GA event when help desk phone is clicked", () => {
  render(<Faq />);

  const phoneLink = screen.getByText("(833) 228-2540");

  fireEvent.click(phoneLink);

  expect(sendGAEvent).toHaveBeenCalledWith("support_contact_phone");
});

it("should fire GA event when help desk email is clicked", () => {
  render(<Faq />);

  const emailLink = screen.getByText("OneMAC_Helpdesk@cms.hhs.gov");

  fireEvent.click(emailLink);

  expect(sendGAEvent).toHaveBeenCalledWith("support_contact_email");
});

describe("Faq", () => {
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
