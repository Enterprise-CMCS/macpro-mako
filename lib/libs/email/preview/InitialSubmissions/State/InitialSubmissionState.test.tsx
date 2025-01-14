import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import AppKCMSEmailPreview from "./AppK";
import ChipSpaStateEmailPreview from "./CHIP_SPA";
import MedSpaStateEmailPreview from "./Medicaid_SPA";
import TempExtStatePreview from "./Temp_Extension";
import * as WaiverCapitated from "./Waiver_Capitated";
import * as WaiverContracting from "./Waiver_Contracting";

describe("Initial Submission State Email Snapshot Test", () => {
  it("renders a AppKCMSEmailPreview Preview Template", () => {
    const template = render(<AppKCMSEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Chipspa Preview Template", () => {
    const template = render(<ChipSpaStateEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid Spa Preview Template", () => {
    const template = render(<MedSpaStateEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a TempExt Preview Template", () => {
    const template = render(<TempExtStatePreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Initial Capitated Waiver Preview Template", () => {
    const template = render(<WaiverCapitated.Waiver1915bStateCapitatedInitialEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Renewal Capitated Waiver Preview Template", () => {
    const template = render(<WaiverCapitated.Waiver1915bStateCapitatedRenewalEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Amendment Capitated Waiver Preview Template", () => {
    const template = render(<WaiverCapitated.Waiver1915bStateCapitatedAmendmentEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Initial Contracting Waiver Preview Template", () => {
    const template = render(<WaiverContracting.Waiver1915bContractingStateInitialEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Renewal Contracting Waiver Preview Template", () => {
    const template = render(<WaiverContracting.Waiver1915bContractingStateRenewalEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Amendment Contracting Waiver Preview Template", () => {
    const template = render(<WaiverContracting.Waiver1915bContractingStateAmendmentEmailPreview />);

    expect(template).toMatchSnapshot();
  });
});
