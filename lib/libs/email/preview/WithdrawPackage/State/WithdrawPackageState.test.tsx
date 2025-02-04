import { describe, it, expect } from "vitest";
import Appk from "./AppK";
import CHIP_SPA from "./CHIP_SPA";
import Medicaid_SPA from "./Medicaid_SPA";
import Waiver_Capitated from "./Waiver_Capitated";
import { renderEmailTemplate } from "../../test-utils";

describe("Withdraw Package State Email Snapshot Test", () => {
  it("renders a Appk Preview Template", () => {
    const template = renderEmailTemplate(<Appk />);
    expect(template).toMatchSnapshot();
  });

  it("renders a ChipSPA Preview Template", () => {
    const template = renderEmailTemplate(<CHIP_SPA />);
    expect(template).toMatchSnapshot();
  });

  it("renders a Medicaid_SPA Preview Template", () => {
    const template = renderEmailTemplate(<Medicaid_SPA />);
    expect(template).toMatchSnapshot();
  });

  it("renders a Waiver Capitated Preview Template", () => {
    const template = renderEmailTemplate(<Waiver_Capitated />);
    expect(template).toMatchSnapshot();
  });
});
