import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import StateWaiver1915bContractingRenewal from "../Waiver1915bContracting/Renewal";

describe("Initial Submission State Email Snapshot Test", () => {
  it("renders a Renewal Contracting Waiver Preview Template", () => {
    const template = render(<StateWaiver1915bContractingRenewal />);

    expect(template).toMatchSnapshot();
  });
});
