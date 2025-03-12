import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CMSWaiver1915bCapitatedRenewal from "../Waiver1915bCapitated/Renewal";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a Renewal Waiver Capitated Preview Template", () => {
    const { asFragment } = render(<CMSWaiver1915bCapitatedRenewal />);

    expect(asFragment()).toMatchSnapshot();
  });
});
