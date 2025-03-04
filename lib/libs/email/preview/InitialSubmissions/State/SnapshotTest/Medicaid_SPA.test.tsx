import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import MedSpaStateEmailPreview from "../Medicaid_SPA";

describe("Initial Submission State Email Snapshot Test", () => {
  it("renders a Medicaid Spa Preview Template", () => {
    const { asFragment } = render(<MedSpaStateEmailPreview />);

    expect(asFragment()).toMatchSnapshot();
  });
});
