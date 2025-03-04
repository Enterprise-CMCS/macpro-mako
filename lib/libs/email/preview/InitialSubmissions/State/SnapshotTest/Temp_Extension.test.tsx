import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import TempExtStatePreview from "../Temp_Extension";
describe("Initial Submission State Email Snapshot Test", () => {
  it("renders a TempExt Preview Template", () => {
    const { asFragment } = render(<TempExtStatePreview />);

    expect(asFragment()).toMatchSnapshot();
  });
});
