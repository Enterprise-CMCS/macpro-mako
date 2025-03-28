import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import StateWaiver1915bContractingRenewal from "../Waiver1915bContracting/Renewal";

describe("Initial Submission State Email Snapshot Test", () => {
  it("renders a Renewal Contracting Waiver Preview Template", () => {
    const template = render(<StateWaiver1915bContractingRenewal />);

    expect(template).toMatchSnapshot();
  });
});
