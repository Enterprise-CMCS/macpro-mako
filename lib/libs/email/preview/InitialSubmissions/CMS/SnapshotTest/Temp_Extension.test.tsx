import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import TempExtCMSPreview from "../Temp_Extension";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a TempExt Preview Template", () => {
    const { asFragment } = render(<TempExtCMSPreview />);

    expect(asFragment()).toMatchSnapshot();
  });
});
