import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";

import AppkCMSEmail from "../preview/Withdraw_Package/CMS/AppK";
import ChipSpaCMSEmail from "../preview/Withdraw_Package/CMS/CHIP_SPA";
import MedicaidSpaCMSEmail from "../preview/Withdraw_Package/CMS/Medicaid_SPA";
import WaiverCapitatedCMSEmail from "../preview/Withdraw_Package/CMS/Waiver_Capitated";
import AppkStateEmail from "../preview/Withdraw_Package/State/AppK";
import ChipSpaStateEmail from "../preview/Withdraw_Package/State/CHIP_SPA";
import MedicaidSpaStateEmail from "../preview/Withdraw_Package/State/Medicaid_SPA";
import WaiverCapitatedStateEmail from "../preview/Withdraw_Package/State/Waiver_Capitated";

afterEach(() => {
  cleanup();
});

describe("Withdraw Package State Email Snapshot Test", () => {
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
    const template = render(<WaiverCapitatedStateEmail />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Appk CMS Preview Template", () => {
    const template = render(<AppkCMSEmail />);

    expect(template).toMatchSnapshot();
  });
  it("renders a ChipSPA CMS Preview Template", () => {
    const template = render(<ChipSpaCMSEmail />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Capitated CMS Preview Template", () => {
    const template = render(<WaiverCapitatedCMSEmail />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid_SPA CMS Preview Template", () => {
    const template = render(<MedicaidSpaCMSEmail />);

    expect(template).toMatchSnapshot();
  });
});
