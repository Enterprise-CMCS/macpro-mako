import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TempExtStatePreview from "../Temp_Extension";
describe("Initial Submission State Email Snapshot Test", () => {
  it("renders a TempExt Preview Template", () => {
    const { asFragment } = render(<TempExtStatePreview />);

    expect(asFragment()).toMatchSnapshot();
  });
});
