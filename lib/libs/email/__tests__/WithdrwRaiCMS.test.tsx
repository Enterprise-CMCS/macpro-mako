import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Appk from "../preview/Withdraw_Rai/CMS/AppK";
import CHIP_SPA from "../preview/Withdraw_Rai/CMS/CHIP_SPA";
import Medicaid_SPA from "../preview/Withdraw_Rai/CMS/Medicaid_SPA";
import Waiver_Contracting from "../preview/Withdraw_Rai/CMS/Waiver_Contracting";

describe("Withdraw RAI CMS Email Snapshot Test", () => {
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
    const template = render(<Waiver_Contracting />);

    expect(template).toMatchSnapshot();
  });
});
