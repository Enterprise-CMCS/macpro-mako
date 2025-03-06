import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import Medicaid_SPA from "../Medicaid_SPA";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a Medicaid SPA Preview Template", () => {
    const { asFragment } = render(<Medicaid_SPA />);

    expect(asFragment()).toMatchSnapshot();
  });
});
