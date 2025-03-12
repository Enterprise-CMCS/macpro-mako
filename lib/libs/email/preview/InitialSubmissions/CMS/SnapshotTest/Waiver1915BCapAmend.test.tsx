import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CMSWaiver1915bCapitatedAmendment from "../Waiver1915bCapitated/Amendment";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a Amendment Waiver Capitated Preview Template", () => {
    const { asFragment } = render(<CMSWaiver1915bCapitatedAmendment />);

    expect(asFragment()).toMatchSnapshot();
  });
});
