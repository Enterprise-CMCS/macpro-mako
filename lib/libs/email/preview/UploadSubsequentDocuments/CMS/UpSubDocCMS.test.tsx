import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import AppKCMSEmailPreview from "./AppK";
import ChipSpaCMSEmailPreview from "./CHIP_SPA";
import MedicaidSpaCMSEmailPreview from "./MED_SPA";
import Waiver1915bCMSEmail from "./Waiver1915b";

describe("Upload Subsequent Document CMS Email Snapshot Test", () => {
  it("renders a AppKCMSEmailPreview Preview Template", () => {
    const template = render(<AppKCMSEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a ChipSPA Preview Template", () => {
    const template = render(<ChipSpaCMSEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid_SPA Preview Template", () => {
    const template = render(<MedicaidSpaCMSEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Capitated Preview Template", () => {
    const template = render(<Waiver1915bCMSEmail />);

    expect(template).toMatchSnapshot();
  });
});
