import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import AppKStateEmailPreview from "./AppK";
import CHIP_SPA from "./CHIP_SPA";
import Medicaid_SPA from "./Medicaid_SPA";
import Waiver_Capitated from "./Waiver_Capitated";

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
