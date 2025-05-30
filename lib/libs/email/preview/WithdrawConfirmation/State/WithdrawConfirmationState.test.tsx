import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Appk from "./AppK";
import CHIP_SPA from "./CHIP_SPA";
import Medicaid_SPA from "./Medicaid_SPA";
import Waiver from "./Waiver";

describe("Withdraw Confirmation State Email Snapshot Test", () => {
  it("renders a Appk Preview Template", () => {
    const template = render(<Appk />);

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
  it("renders a Waiver Preview Template", () => {
    const template = render(<Waiver />);

    expect(template).toMatchSnapshot();
  });
});
