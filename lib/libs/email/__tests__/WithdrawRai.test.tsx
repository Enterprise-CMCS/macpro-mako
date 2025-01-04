import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import AppkStateEmail from "../preview/Withdraw_Rai/State/AppK";
import ChipSpaStateEmail from "../preview/Withdraw_Rai/State/CHIP_SPA";
import MedicaidSpaStateEmail from "../preview/Withdraw_Rai/State/Medicaid_SPA";
import WaiverContractingStateEmail from "../preview/Withdraw_Rai/State/Waiver_Contracting";
import AppkCMS from "../preview/Withdraw_Rai/CMS/AppK";
import CHIP_SPACMS from "../preview/Withdraw_Rai/CMS/CHIP_SPA";
import MedicaidSpaCMS from "../preview/Withdraw_Rai/CMS/Medicaid_SPA";
import WaiverContractingCMS from "../preview/Withdraw_Rai/CMS/Waiver_Contracting";

afterEach(() => {
  cleanup();
});

describe("Withdraw RAI State Email Snapshot Test", () => {
  it("renders a Appk Preview Template", () => {
    const template = render(<AppkStateEmail />);

    expect(template).toMatchSnapshot();
  });
  it("renders a ChipSPA Preview Template", () => {
    const template = render(<ChipSpaStateEmail />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid_SPA Preview Template", () => {
    const template = render(<MedicaidSpaStateEmail />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Capitated Preview Template", () => {
    const template = render(<WaiverContractingStateEmail />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Appk Preview Template", () => {
    const template = render(<AppkCMS />);

    expect(template).toMatchSnapshot();
  });
  it("renders a ChipSPA Preview Template", () => {
    const template = render(<CHIP_SPACMS />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid_SPA Preview Template", () => {
    const template = render(<MedicaidSpaCMS />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Capitated Preview Template", () => {
    const template = render(<WaiverContractingCMS />);

    expect(template).toMatchSnapshot();
  });
});
