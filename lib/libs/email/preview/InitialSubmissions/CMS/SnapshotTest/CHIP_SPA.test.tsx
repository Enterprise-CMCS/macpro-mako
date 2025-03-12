import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ChipSpaCMSEmailPreview from "../CHIP_SPA";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a CHIP SPA Preview Template", () => {
    const { asFragment } = render(<ChipSpaCMSEmailPreview />);

    expect(asFragment()).toMatchSnapshot();
  });
});
