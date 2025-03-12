import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AppKCMSEmailPreview from "../AppK";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a AppkCMSEmail Preview Template", () => {
    const { asFragment } = render(<AppKCMSEmailPreview />);

    expect(asFragment()).toMatchSnapshot();
  });
});
