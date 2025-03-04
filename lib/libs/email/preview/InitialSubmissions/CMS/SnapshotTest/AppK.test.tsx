import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import AppKCMSEmailPreview from "../AppK";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a AppkCMSEmail Preview Template", () => {
    const { asFragment } = render(<AppKCMSEmailPreview />);

    expect(asFragment()).toMatchSnapshot();
  });
});
