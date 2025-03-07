import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import ChipSpaStateEmailPreview from "../CHIP_SPA";

describe("Initial Submission State Email Snapshot Test", () => {
  it("renders a Chipspa Preview Template", () => {
    const { asFragment } = render(<ChipSpaStateEmailPreview />);

    expect(asFragment()).toMatchSnapshot();
  });
});
