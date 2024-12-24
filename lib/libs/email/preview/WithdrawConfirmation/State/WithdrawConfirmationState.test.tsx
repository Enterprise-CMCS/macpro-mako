import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import Appk from "../../WithdrawConfirmation/State/AppK";
import CHIP_SPA from "../../WithdrawConfirmation/State/CHIP_SPA";
import Medicaid_SPA from "../../WithdrawConfirmation/State/Medicaid_SPA";
import Waiver from "../../WithdrawConfirmation/State/Waiver";

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
  it("renders a Waiver Capitated Preview Template", () => {
    const template = render(<Waiver />);

    expect(template).toMatchSnapshot();
  });
});
