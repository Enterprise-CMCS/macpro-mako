import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import AppKStateEmailPreview from "../preview/Respond_to_Rai/State/AppK";
import CHIP_SPA from "../preview/Respond_to_Rai/State/CHIP_SPA";
import Medicaid_SPA from "../preview/Respond_to_Rai/State/Medicaid_SPA";
import Waiver_Capitated from "../preview/Respond_to_Rai/State/Waiver_Capitated";

beforeEach(() => {
  cleanup();
});

describe("Respond To Rai State Email Snapshot Test", () => {
  it("renders a AppKStateEmailPreview Preview Template", () => {
    const template = render(<AppKStateEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a ChipSPA Preview Template", () => {
    const template = render(<CHIP_SPA />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid_SPA Preview Template", () => {
    const template = render(<Medicaid_SPA />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Capitated Preview Template", () => {
    const template = render(<Waiver_Capitated />);

    expect(template).toMatchSnapshot();
  });
});
