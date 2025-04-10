import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Medicaid_SPA from "../Medicaid_SPA";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a Medicaid SPA Preview Template", () => {
    const { asFragment } = render(<Medicaid_SPA />);

    expect(asFragment()).toMatchSnapshot();
  });
});
