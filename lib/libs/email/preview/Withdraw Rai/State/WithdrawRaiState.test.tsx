import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import Appk from "./AppK";
import CHIP_SPA from "./CHIP_SPA";
import Medicaid_SPA from "./Medicaid_SPA";
import Waiver_Contracting from "./Waiver_Contracting";

describe("Withdraw RAI State Email Snapshot Test", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const now = new Date(2023, 0, 1);
    vi.setSystemTime(now);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("renders a Appk Preview Template", () => {
    const template = render(<Appk />);

    expect(template).toMatchSnapshot();
  });
  it("renders a ChipSPA Preview Template", () => {
    const template = render(<CHIP_SPA />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Medicaid_SPA Preview Template", () => {
    const template = render(<Medicaid_SPA />);

    expect(template).toMatchSnapshot();
  });
  it("renders a Waiver Capitated Preview Template", () => {
    const template = render(<Waiver_Contracting />);

    expect(template).toMatchSnapshot();
  });
});
