import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import AppKCMSEmailPreview from "./AppK";
import ChipSpaCMSEmailPreview from "./CHIP_SPA";
import MedSpaCMSEmailPreview from "./MED_SPA";
import Waiver1915bCMSEmail from "./Waiver1915b";

describe("Upload Subsequent Document CMS Email Snapshot Test", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const now = new Date(2023, 0, 1);
    vi.setSystemTime(now);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("renders a AppKCMSEmailPreview Preview Template", () => {
    const template = render(<AppKCMSEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a ChipSPA Preview Template", () => {
    const template = render(<ChipSpaCMSEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid_SPA Preview Template", () => {
    const template = render(<MedSpaCMSEmailPreview />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Capitated Preview Template", () => {
    const template = render(<Waiver1915bCMSEmail />);

    expect(template).toMatchSnapshot();
  });
});
