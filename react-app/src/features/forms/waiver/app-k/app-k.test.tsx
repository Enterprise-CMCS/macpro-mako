import { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { describe, vi, test, expect, beforeAll } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";
import { appkSchema } from "shared-types";
import { AppKAmendmentForm } from ".";
import { skipCleanup } from "@/utils/test-helpers/skipCleanup";

vi.mock("@/components/Inputs/upload.utilities", () => ({
  getPresignedUrl: vi.fn(async () => "hello world"),
  uploadToS3: vi.fn(async () => {}),
  extractBucketAndKeyFromUrl: vi.fn(() => ({ bucket: "hello", key: "world" })),
}));

class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || "mouse";
  }
}
window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);
vi.mock("@/api/useGetUser", () => ({
  useGetUser: vi.fn().mockReturnValue({
    data: {
      user: {
        "custom:state": "OH",
      },
    },
  }),
}));

const upload = uploadFiles<typeof appkSchema>();

let container: HTMLElement;

describe("App K", async () => {
  beforeAll(() => {
    skipCleanup();

    const { container: renderedContainer } = render(<AppKAmendmentForm />, {
      wrapper,
    });

    container = renderedContainer;
  });

  test("STATE DROPDOWN", async () => {
    const stateDropDown = screen.getByRole("combobox");

    await userEvent.click(stateDropDown);

    const stateToClick = screen.getByRole("option", {
      name: /ohio/i,
    });

    expect(stateToClick).toBeInTheDocument();

    await userEvent.click(stateToClick);

    const addIdButton = screen.getByRole("button", {
      name: /add id/i,
    });

    expect(addIdButton).toBeInTheDocument();
  });

  test("WAIVER ID", async () => {
    const addIdButton = screen.getByRole("button", {
      name: /add id/i,
    });
    await userEvent.click(addIdButton);

    const waiverIdInput = screen.getByPlaceholderText("#####.R##.##");

    await userEvent.type(waiverIdInput, "0000.R00.01");

    expect(waiverIdInput).not.toHaveClass("border-500");
  });

  test("AMENDMENT TITLE", async () => {
    const amendmentTitleTextBox = screen.getByLabelText(/amendment title/i);

    await userEvent.type(amendmentTitleTextBox, "Testing");

    expect(amendmentTitleTextBox).not.toHaveClass("text-destructive");
  });

  test("PROPOSED EFFECTIVE DATE OF APP-K WAIVER", async () => {
    await userEvent.click(
      screen.getByTestId("proposedEffectiveDate-datepicker"),
    );
    await userEvent.keyboard("{Enter}");
    const proposedEffectiveDateLabel = container.querySelector(
      '[for="proposedEffectiveDate"]',
    );

    expect(proposedEffectiveDateLabel).not.toHaveClass("text-destructive");
  });

  test("CMS FORM 179", async () => {
    const cmsForm179PlanLabel = await upload("appk");
    expect(cmsForm179PlanLabel).not.toHaveClass("text-destructive");
  });

  test("OTHER", async () => {
    const spaPagesLabel = await upload("other");

    expect(spaPagesLabel).not.toHaveClass("text-destructive");
  });

  test("submit button is enabled", () => {
    expect(screen.getByTestId("submit-action-form")).toBeEnabled();
  });
});
