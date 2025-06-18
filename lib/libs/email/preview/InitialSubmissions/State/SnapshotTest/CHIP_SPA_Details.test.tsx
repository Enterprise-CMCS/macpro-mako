import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ChipSpaDetailsStateEmailPreview from "../CHIP_SPA_Details";

describe("Initial Submission Details State Email Snapshot Test", () => {
  it("renders a Chipspa Preview Template", () => {
    const { asFragment } = render(<ChipSpaDetailsStateEmailPreview />);

    expect(asFragment()).toMatchSnapshot();
  });
});
