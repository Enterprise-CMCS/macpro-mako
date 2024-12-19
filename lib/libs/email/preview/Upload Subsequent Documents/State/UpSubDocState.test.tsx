import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import AppKStateEmailPreview from "./AppK";
import ChipSpaStateEmailPreview from "./CHIP_SPA";
import MedicaidSpaStateEmailPreview from "./MED_SPA";
import Waiver1915bStateEmail from "./Waiver1915b";

describe("Upload Subsequent Document CMS Email Snapshot Test", () => {
  it("renders a AppKCMSEmailPreview Preview Template", () => {
    const template = render(<AppKStateEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a ChipSPA Preview Template", () => {
    const template = render(<ChipSpaStateEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid_SPA Preview Template", () => {
    const template = render(<MedicaidSpaStateEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Capitated Preview Template", () => {
    const template = render(<Waiver1915bStateEmail />);

    expect(template).toMatchSnapshot();
  });
});
