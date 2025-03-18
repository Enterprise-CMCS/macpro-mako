import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AppKCMSEmailPreview from "../AppK";

describe("Initial Submission State Email Snapshot Test", () => {
  it("renders a AppKCMSEmailPreview Preview Template", () => {
    const { asFragment } = render(<AppKCMSEmailPreview />);

    expect(asFragment()).toMatchSnapshot();
  });
});
