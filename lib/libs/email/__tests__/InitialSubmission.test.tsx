import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import AppkCMS from "../preview/Initial_Submissions/CMS/AppK";
import ChipSpaCMS from "../preview/Initial_Submissions/CMS/CHIP_SPA";
import MedicaidSpaCMS from "../preview/Initial_Submissions/CMS/Medicaid_SPA";
import TempExtCMS from "../preview/Initial_Submissions/CMS/Temp_Extension";
import WaiverInitialCMSEmailPreview from "../preview/Initial_Submissions/CMS/Waiver1915bCMS";
import WaiverInitialStateEmailPreview from "../preview/Initial_Submissions/State/Waiver1915bState";
import AppKState from "../preview/Initial_Submissions/State/AppK";
import ChipSpaState from "../preview/Initial_Submissions/State/CHIP_SPA";
import MedicaidSpaState from "../preview/Initial_Submissions/State/Medicaid_SPA";

afterEach(() => {
  cleanup();
});

describe("Initial Submission Email Snapshot Test", () => {
  it("renders a AppkCMSEmail Preview Template", async () => {
    const template = render(<AppkCMS />);

    expect(template).toMatchSnapshot();
  });
  it("renders a AppkState Preview Template", async () => {
    const template = render(<AppKState />);

    expect(template).toMatchSnapshot();
  });
  it("renders a ChipspaCMS Preview Template", () => {
    const template = render(<ChipSpaCMS />);

    expect(template).toMatchSnapshot();
  });
  it("renders a ChipspaState Preview Template", () => {
    const template = render(<ChipSpaState />);

    expect(template).toMatchSnapshot();
  });
  it("renders a MedicaidSpaCMS Preview Template", () => {
    const template = render(<MedicaidSpaCMS />);

    expect(template).toMatchSnapshot();
  });
  it("renders a MedicaidSpaState Preview Template", () => {
    const template = render(<MedicaidSpaState />);

    expect(template).toMatchSnapshot();
  });
  it("renders a TempExtCMS Preview Template", () => {
    const template = render(<TempExtCMS />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Initial Contracting CMS Preview Template", () => {
    const template = render(
      <WaiverInitialCMSEmailPreview variables={{ event: "contracting-initial" }} />,
    );

    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Initial Capitated CMS Preview Template", () => {
    const template = render(
      <WaiverInitialCMSEmailPreview variables={{ event: "capitated-initial" }} />,
    );

    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Initial Contracting State Preview Template", () => {
    const template = render(
      <WaiverInitialStateEmailPreview variables={{ event: "contracting-initial" }} />,
    );

    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Initial Capitated State Preview Template", () => {
    const template = render(
      <WaiverInitialStateEmailPreview variables={{ event: "capitated-initial" }} />,
    );

    expect(template).toMatchSnapshot();
  });
});
