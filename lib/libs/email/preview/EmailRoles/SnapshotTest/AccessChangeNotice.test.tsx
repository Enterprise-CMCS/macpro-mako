import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AccessChangeNotice from "../AccessChangeNotice";

describe("Access Change Notice Email Snapshot Test", () => {
  it("renders a AppkCMSEmail Preview Template", () => {
    const { asFragment } = render(<AccessChangeNotice />);

    expect(asFragment()).toMatchSnapshot();
  });
});
