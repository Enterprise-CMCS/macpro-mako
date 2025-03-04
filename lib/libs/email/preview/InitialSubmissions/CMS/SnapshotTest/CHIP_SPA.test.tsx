import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import ChipSpaCMSEmailPreview from "../CHIP_SPA";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a Chipspa Preview Template", () => {
    const { asFragment } = render(<ChipSpaCMSEmailPreview />);

    expect(asFragment()).toMatchSnapshot();
  });
});
