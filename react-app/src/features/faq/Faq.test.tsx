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
  phoneLink.addEventListener("click", (event) => event.preventDefault());

  fireEvent.click(phoneLink);

  expect(sendGAEvent).toHaveBeenCalledWith("support_contact_phone");
});

it("should fire GA event when help desk email is clicked", () => {
  render(<Faq />);

  const emailLink = screen.getByText("OneMAC_Helpdesk@cms.hhs.gov");
  emailLink.addEventListener("click", (event) => event.preventDefault());

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

    render(<Faq />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Frequently Asked Questions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand all to search with CTRL + F" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("What is FAQ 1?")).toBeInTheDocument();
    expect(screen.getByText("What is FAQ 2?")).toBeInTheDocument();
    expect(screen.getByText("Answer 1")).toBeVisible();
    expect(screen.queryByText("Answer 2")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Call the OneMAC Helpdesk" })).toHaveAttribute(
      "href",
      "tel:(833) 228-2540",
    );
    expect(screen.getByRole("link", { name: "Email the OneMAC Helpdesk" })).toHaveAttribute(
      "href",
      "mailto:OneMAC_Helpdesk@cms.hhs.gov",
    );
  });
});
