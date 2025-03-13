import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TempExtCMSPreview from "../Temp_Extension";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a TempExt Preview Template", () => {
    const { asFragment } = render(<TempExtCMSPreview />);

    expect(asFragment()).toMatchSnapshot();
  });
});
