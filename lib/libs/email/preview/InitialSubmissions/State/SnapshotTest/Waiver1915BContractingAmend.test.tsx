import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import StateWaiver1915bContractingAmendment from "../Waiver1915bContracting/Amendment";

describe("Initial Submission State Email Snapshot Test", () => {
  it("renders a Amendment Contracting Waiver Preview Template", () => {
    const template = render(<StateWaiver1915bContractingAmendment />);

    expect(template).toMatchSnapshot();
  });
});
