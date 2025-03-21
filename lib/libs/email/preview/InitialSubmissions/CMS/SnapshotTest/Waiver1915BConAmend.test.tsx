import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CMSWaiver1915bContractingAmendment from "../Waiver1915bContracting/Amendment";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a Amendment Waiver Contracting Preview Template", () => {
    const { asFragment } = render(<CMSWaiver1915bContractingAmendment />);

    expect(asFragment()).toMatchSnapshot();
  });
});
