import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AppKCMSEmail } from "../content/new-submission/emailTemplates/AppKCMS";
import { emailTemplateValue } from "../mock-data/new-submission";
import ChipSpaCMSEmailPreview from "../preview/Initial_Submissions/CMS/CHIP_SPA";
import MedicaidSPA from "../preview/Initial_Submissions/CMS/Medicaid_SPA";
import TempExtCMSPreview from "../preview/Initial_Submissions/CMS/Temp_Extension";
import Waiver1915bCMSEmailPreview from "../preview/Initial_Submissions/CMS/Waiver_Capitated";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a AppkCMSEmail Preview Template", async () => {
    const template = (
      <AppKCMSEmail
        variables={{
          ...emailTemplateValue,
          event: "app-k",
          id: "CO-1234.R21.00",
          authority: "1915(c)",
          actionType: "Amend",
          title: "A Perfect Appendix K Amendment Title",
          attachments: {
            appk: {
              label: "AppK",
              files: [],
            },
            other: {
              label: "Other",
              files: [],
            },
          },
        }}
      />
    );

    expect(template).toMatchSnapshot();
  });
  it("renders a Chipspa Preview Template", () => {
    const template = render(<ChipSpaCMSEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid Spa Preview Template", () => {
    const template = render(<MedicaidSPA />);

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
