import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AdditionalInformation } from "./AdditionalInformation";
import { sendGAEvent } from "../../utils/ReactGA/SendGAEvent";
import React from "react";

// Mocks
vi.mock("../../utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));
vi.mock("../../utils/ReactGA/Mapper", () => ({
  mapSubmissionTypeBasedOnActionFormTitle: vi.fn(() => "chip_spa"),
}));

// since this component uses various form inputs 
vi.mock("../Inputs", () => ({
  FormItem: ({ children }) => <div>{children}</div>,
  FormLabel: ({ children, htmlFor }) => <label htmlFor={htmlFor}>{children}</label>,
  FormDescription: ({ children }) => <div>{children}</div>,
  Textarea: (props) => <textarea {...props} />,
}));

describe("AdditionalInformation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends a GA event on the first character typed", async () => {
    const user = userEvent.setup();

    // Use React state to simulate how react-hook-form controls the value
    function Wrapper() {
      const [value, setValue] = React.useState("");
      const field = {
        name: "additionalInfo",
        value,
        onBlur: vi.fn(),
        ref: vi.fn(),
        onChange: (e) => {
          setValue(e.target.value);
        },
      };

      return <AdditionalInformation field={field} label="Additional Info" submissionTitle="CHIP" />;
    }

    render(<Wrapper />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "H"); // typing the first character

    expect(sendGAEvent).toHaveBeenCalledTimes(1);
    expect(sendGAEvent).toHaveBeenCalledWith("submit_additional_info_used", {
      submission_type: "chip_spa",
    });
  });

  it("does not send another GA event when typing after the first character", async () => {
    const user = userEvent.setup();

    function Wrapper() {
      const [value, setValue] = React.useState("");
      const field = {
        name: "additionalInfo",
        value,
        onBlur: vi.fn(),
        ref: vi.fn(),
        onChange: (e) => {
          setValue(e.target.value);
        },
      };

      return <AdditionalInformation field={field} label="Additional Info" submissionTitle="CHIP" />;
    }

    render(<Wrapper />);

    const textarea = screen.getByRole("textbox");

    await user.type(textarea, "Hello");

    // Should only call GA once, on first character as opposed to 5 for each character that is typed
    expect(sendGAEvent).toHaveBeenCalledTimes(1);
  });
});
