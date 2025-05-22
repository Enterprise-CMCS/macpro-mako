import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AdminPendingNotice from "../AdminPendingNotice";

describe("Admin Pending Notice Email Snapshot Test", () => {
  it("renders a AppkCMSEmail Preview Template", () => {
    const { asFragment } = render(<AdminPendingNotice />);

    expect(asFragment()).toMatchSnapshot();
  });
});
