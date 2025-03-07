import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import StateWaiver1915bCapitatedInitial from "../Waiver1915bCapitated/Initial";

describe("Initial Submission State Email Snapshot Test", () => {
  it("renders a Initial Capitated Waiver Preview Template", () => {
    const { asFragment } = render(<StateWaiver1915bCapitatedInitial />);

    expect(asFragment()).toMatchSnapshot();
  });
});
