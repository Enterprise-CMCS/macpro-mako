import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import AppKCMSEmailPreview from "./__snapshots__/AppK";
import ChipSpaCMSEmailPreview from "./CHIP_SPA";
import Medicaid_SPA from "./Medicaid_SPA";
import TempExtCMSPreview from "./Temp_Extension";
import CMSWaiver1915bCapitatedInitial from "./Waiver1915bCapitated/Initial";
import CMSWaiver1915bCapitatedRenewal from "./Waiver1915bCapitated/Renewal";
import CMSWaiver1915bCapitatedAmendment from "./Waiver1915bCapitated/Amendment";
import CMSWaiver1915bContractingInitial from "./Waiver1915bContracting/Initial";
import CMSWaiver1915bContractingRenewal from "./Waiver1915bContracting/Renewal";
import CMSWaiver1915bContractingAmendment from "./Waiver1915bContracting/Amendment";

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
    const template = render(<CMSWaiver1915bCapitatedInitial />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Renewal Waiver Capitated Preview Template", () => {
    const template = render(<CMSWaiver1915bCapitatedRenewal />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Amendment Waiver Capitated Preview Template", () => {
    const template = render(<CMSWaiver1915bCapitatedAmendment />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Initial Waiver Contracting Preview Template", () => {
    const template = render(<CMSWaiver1915bContractingInitial />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Renewal Waiver Contracting Preview Template", () => {
    const template = render(<CMSWaiver1915bContractingRenewal />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Amendment Waiver Contracting Preview Template", () => {
    const template = render(<CMSWaiver1915bContractingAmendment />);

    expect(template).toMatchSnapshot();
  });
});
