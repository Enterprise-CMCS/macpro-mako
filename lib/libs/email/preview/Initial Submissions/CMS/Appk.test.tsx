import { describe, it, expect } from "vitest";
import AppKCMSEmailPreview from "./AppK";
import { render } from "@testing-library/react";

describe("AppKCMSEmail initial Snapshot Test", () => {
  it("renders a AppkCMSEmail Preview Template", () => {
    const template = render(<AppKCMSEmailPreview />);

    expect(template).toMatchSnapshot();
  });
});
