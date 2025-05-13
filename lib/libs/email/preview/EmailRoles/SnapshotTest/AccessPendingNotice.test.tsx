import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AccessPendingNotice from "../AccessPendingNotice";

describe("Access Pending Notice Email Snapshot Test", () => {
  it("renders a AppkCMSEmail Preview Template", () => {
    const { asFragment } = render(<AccessPendingNotice />);

    expect(asFragment()).toMatchSnapshot();
  });
});
