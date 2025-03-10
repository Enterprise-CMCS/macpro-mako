import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import CMSWaiver1915bContractingRenewal from "../Waiver1915bContracting/Renewal";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a Renewal Waiver Contracting Preview Template", () => {
    const { asFragment } = render(<CMSWaiver1915bContractingRenewal />);

    expect(asFragment()).toMatchSnapshot();
  });
});
