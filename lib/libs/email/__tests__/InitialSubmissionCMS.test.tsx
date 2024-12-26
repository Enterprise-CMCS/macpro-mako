import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import AppKCMSEmailPreview from "../preview/Initial_Submissions/CMS/AppK";
import ChipSpaCMSEmailPreview from "../preview/Initial_Submissions/CMS/CHIP_SPA";
import Medicaid_SPA from "../preview/Initial_Submissions/CMS/Medicaid_SPA";
import TempExtCMSPreview from "../preview/Initial_Submissions/CMS/Temp_Extension";
import Waiver1915bCMSEmailPreview from "../preview/Initial_Submissions/CMS/Waiver_Capitated";

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
  it("renders a Waiver Capitated Preview Template", () => {
    const template = render(<Waiver1915bCMSEmailPreview />);

    expect(template).toMatchSnapshot();
  });
});
