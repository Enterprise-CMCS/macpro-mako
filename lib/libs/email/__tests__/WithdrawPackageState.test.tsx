import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import Appk from "../preview/Withdraw_Package/State/AppK";
import CHIP_SPA from "../preview/Withdraw_Package/State/CHIP_SPA";
import Medicaid_SPA from "../preview/Withdraw_Package/State/Medicaid_SPA";
import Waiver_Capitated from "../preview/Withdraw_Package/State/Waiver_Capitated";

describe("Withdraw Package State Email Snapshot Test", () => {
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
    const template = render(<Waiver_Capitated />);

    expect(template).toMatchSnapshot();
  });
});
