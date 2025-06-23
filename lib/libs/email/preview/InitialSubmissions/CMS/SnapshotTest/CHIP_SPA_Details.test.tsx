import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ChipSpaDetailsCMSEmailPreview from "../CHIP_SPA_Details";

describe("Initial Submission Details CMS Email Snapshot Test", () => {
  it("renders a CHIP SPA Preview Template", () => {
    const { asFragment } = render(<ChipSpaDetailsCMSEmailPreview />);

    expect(asFragment()).toMatchSnapshot();
  });
});
