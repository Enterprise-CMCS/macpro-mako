import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import StateWaiver1915bCapitatedRenewal from "../Waiver1915bCapitated/Renewal";

describe("Initial Submission State Email Snapshot Test", () => {
  it("renders a Initial Capitated Waiver Preview Template", () => {
    const { asFragment } = render(<StateWaiver1915bCapitatedRenewal />);

    expect(asFragment()).toMatchSnapshot();
  });
});
