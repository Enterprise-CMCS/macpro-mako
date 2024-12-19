import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

import AppKCMSEmailPreview from "./AppK";
import ChipSpaStateEmailPreview from "./CHIP_SPA";
import MedSpaStateEmailPreview from "./Medicaid_SPA";
import TempExtStatePreview from "./Temp_Extension";
import Waiver1915bStateEmailPreview from "./Waiver_Capitated";
import Waiver1915bContractingStateEmailPreview from "./Waiver_Contracting";

describe("Initial Submission State Email Snapshot Test", () => {
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
  it("renders a Waiver Capitated Preview Template", () => {
    const template = render(<Waiver1915bStateEmailPreview />);

    expect(template).toMatchSnapshot();
  });
});
it("renders a Waiver Contracting Preview Template", () => {
  const template = render(<Waiver1915bContractingStateEmailPreview />);

  expect(template).toMatchSnapshot();
});
