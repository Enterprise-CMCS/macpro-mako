import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import AppKCMSEmail from "../preview/Respond_to_Rai/CMS/AppK";
import ChipSpaCMSEmail from "../preview/Respond_to_Rai/CMS/CHIP_SPA";
import MedSpaCMSEmail from "../preview/Respond_to_Rai/CMS/Medicaid_SPA";
import WaiverStateEmail from "../preview/Respond_to_Rai/CMS/Waiver_Capitated";
import ChipSpaStateEmail from "../preview/Respond_to_Rai/State/CHIP_SPA";
import AppKStateEmail from "../preview/Withdraw_Rai/State/AppK";
import MedSpaStateEmail from "../preview/Respond_to_Rai/State/Medicaid_SPA";

afterEach(() => {
  cleanup();
});

describe("Respond To Rai State Email Snapshot Test", () => {
  it("renders a ChipSPA Preview Template", () => {
    const template = render(<ChipSpaStateEmail />);
    expect(template).toMatchSnapshot();
  });
  it("renders a AppK Preview Template", () => {
    const template = render(<AppKStateEmail />);
    expect(template).toMatchSnapshot();
  });
  it("renders a AppK CMS Preview Template", () => {
    const template = render(<AppKCMSEmail />);
    expect(template).toMatchSnapshot();
  });
  it("renders a ChipSPA Preview Template", () => {
    const template = render(<ChipSpaCMSEmail />);
    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid_SPA Preview Template", () => {
    const template = render(<MedSpaStateEmail />);
    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid_CMS Preview Template", () => {
    const template = render(<MedSpaCMSEmail />);
    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Capitated Preview Template", () => {
    const template = render(<WaiverStateEmail />);
    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Capitated CMS Preview Template", () => {
    const template = render(<WaiverStateEmail />);
    expect(template).toMatchSnapshot();
  });
});
