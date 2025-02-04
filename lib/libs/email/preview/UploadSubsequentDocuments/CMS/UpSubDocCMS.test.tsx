import { describe, it, expect } from "vitest";
import AppKCMSEmailPreview from "./AppK";
import ChipSpaCMSEmailPreview from "./CHIP_SPA";
import MedicaidSpaCMSEmailPreview from "./MED_SPA";
import Waiver1915bCMSEmail from "./Waiver1915b";
import { renderEmailTemplate } from "../../test-utils";

describe("Upload Subsequent Document CMS Email Snapshot Test", () => {
  it("renders a AppKCMSEmailPreview Preview Template", () => {
    const template = renderEmailTemplate(<AppKCMSEmailPreview />);
    expect(template).toMatchSnapshot();
  });

  it("renders a ChipSPA Preview Template", () => {
    const template = renderEmailTemplate(<ChipSpaCMSEmailPreview />);
    expect(template).toMatchSnapshot();
  });

  it("renders a Medicaid_SPA Preview Template", () => {
    const template = renderEmailTemplate(<MedicaidSpaCMSEmailPreview />);
    expect(template).toMatchSnapshot();
  });

  it("renders a Waiver Capitated Preview Template", () => {
    const template = renderEmailTemplate(<Waiver1915bCMSEmail />);
    expect(template).toMatchSnapshot();
  });
});
