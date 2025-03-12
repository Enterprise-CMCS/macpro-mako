import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import StateWaiver1915bContractingInitial from "../Waiver1915bContracting/Initial";

describe("Initial Submission State Email Snapshot Test", () => {
  it("renders a Initial Contracting Waiver Preview Template", () => {
    const template = render(<StateWaiver1915bContractingInitial />);

    expect(template).toMatchSnapshot();
  });
});
