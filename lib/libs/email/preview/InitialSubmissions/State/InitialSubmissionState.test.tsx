import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import AppKCMSEmailPreview from "./AppK";
import ChipSpaStateEmailPreview from "./CHIP_SPA";
import MedSpaStateEmailPreview from "./Medicaid_SPA";
import TempExtStatePreview from "./Temp_Extension";
import StateWaiver1915bCapitatedInitial from "./Waiver1915bCapitated/Initial";
import StateWaiver1915bCapitatedRenewal from "./Waiver1915bCapitated/Renewal";
import StateWaiver1915bCapitatedAmendment from "./Waiver1915bCapitated/Amendment";
import StateWaiver1915bContractingInitial from "./Waiver1915bContracting/Initial";
import StateWaiver1915bContractingRenewal from "./Waiver1915bContracting/Renewal";
import StateWaiver1915bContractingAmendment from "./Waiver1915bContracting/Amendment";

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
    const template = render(<StateWaiver1915bCapitatedInitial />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Renewal Capitated Waiver Preview Template", () => {
    const template = render(<StateWaiver1915bCapitatedRenewal />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Amendment Capitated Waiver Preview Template", () => {
    const template = render(<StateWaiver1915bCapitatedAmendment />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Initial Contracting Waiver Preview Template", () => {
    const template = render(<StateWaiver1915bContractingInitial />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Renewal Contracting Waiver Preview Template", () => {
    const template = render(<StateWaiver1915bContractingRenewal />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Amendment Contracting Waiver Preview Template", () => {
    const template = render(<StateWaiver1915bContractingAmendment />);

    expect(template).toMatchSnapshot();
  });
});
