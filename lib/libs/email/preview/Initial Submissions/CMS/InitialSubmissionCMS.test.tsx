import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

import AppKCMSEmailPreview from "./AppK";
import ChipSpaCMSEmailPreview from "./CHIP_SPA";
import Medicaid_SPA from "./Medicaid_SPA";
import TempExtCMSPreview from "./Temp_Extension";
import Waiver1915bCMSEmailPreview from "./Waiver_Capitated";

describe("Initial Submission CMS Email Snapshot Test", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const now = new Date(2023, 0, 1);
    vi.setSystemTime(now);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
