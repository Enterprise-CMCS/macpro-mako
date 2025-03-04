import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import StateWaiver1915bCapitatedAmendment from "../Waiver1915bCapitated/Amendment";

describe("Initial Submission State Email Snapshot Test", () => {
  it("renders a Amendment Capitated Waiver Preview Template", () => {
    const { asFragment } = render(<StateWaiver1915bCapitatedAmendment />);

    expect(asFragment()).toMatchSnapshot();
  });
});
