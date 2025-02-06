import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import CHIP_SPA from "./CHIP_SPA";
import Medicaid_SPA from "./Medicaid_SPA";
import Waiver from "./Waiver";

describe("Respond To RAI CMS Email Snapshot Test", () => {
  it("renders a ChipSPA Preview Template", () => {
    const template = render(<CHIP_SPA />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid_SPA Preview Template", () => {
    const template = render(<Medicaid_SPA />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Preview Template", () => {
    const template = render(<Waiver />);

    expect(template).toMatchSnapshot();
  });
});
