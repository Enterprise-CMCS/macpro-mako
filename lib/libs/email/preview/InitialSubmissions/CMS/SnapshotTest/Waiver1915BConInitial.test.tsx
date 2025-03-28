import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CMSWaiver1915bContractingInitial from "../Waiver1915bContracting/Initial";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a Initial Waiver Contracting Preview Template", () => {
    const { asFragment } = render(<CMSWaiver1915bContractingInitial />);

    expect(asFragment()).toMatchSnapshot();
  });
});
