import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import AppKCMSEmailPreview from "./__snapshots__/AppK";
import ChipSpaCMSEmailPreview from "./CHIP_SPA";
import Medicaid_SPA from "./Medicaid_SPA";
import TempExtCMSPreview from "./Temp_Extension";
import * as WaiverCapitated from "./Waiver_Capitated";
import * as WaiverContracting from "./Waiver_Contracting";
describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a AppkCMSEmail Preview Template", () => {
    const template = render(<AppKCMSEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Chipspa Preview Template", () => {
    const template = render(<ChipSpaCMSEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid Spa Preview Template", () => {
    const template = render(<Medicaid_SPA />);

    expect(template).toMatchSnapshot();
  });
  it("renders a TempExt Preview Template", () => {
    const template = render(<TempExtCMSPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Initial Waiver Capitated Preview Template", () => {
    const template = render(<WaiverCapitated.Waiver1915bCMSCapitatedInitialEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Renewal Waiver Capitated Preview Template", () => {
    const template = render(<WaiverCapitated.Waiver1915bCMSCapitatedRenewalEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Amendment Waiver Capitated Preview Template", () => {
    const template = render(<WaiverCapitated.Waiver1915bCMSCapitatedAmendmentEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Amendment Waiver Contracting Preview Template", () => {
    const template = render(<WaiverContracting.Waiver1915bCMSContractingAmendmentEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Renewal Waiver Contracting Preview Template", () => {
    const template = render(<WaiverContracting.Waiver1915bCMSContractingRenewalEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Initial Waiver Contracting Preview Template", () => {
    const template = render(<WaiverContracting.Waiver1915bCMSContractingInitialEmailPreview />);

    expect(template).toMatchSnapshot();
  });
});
