import { describe, it, expect, afterEach } from "vitest";
import { render } from "@testing-library/react";
import AppKCMSEmailPreview from "../preview/Upload_Subsequent_Documents/CMS/AppK";
import ChipSpaCMSEmailPreview from "../preview/Upload_Subsequent_Documents/CMS/CHIP_SPA";
import MedicaidSpaCMSEmailPreview from "../preview/Upload_Subsequent_Documents/CMS/MED_SPA";
import Waiver1915bCMSEmail from "../preview/Upload_Subsequent_Documents/CMS/Waiver1915b";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

describe.skip("Upload Subsequent Document CMS Email Snapshot Test", () => {
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
  it("renders a Waiver1915b Preview Template", () => {
    const template = render(<Waiver1915bCMSEmail />);

    expect(template).toMatchSnapshot();
  });
});
