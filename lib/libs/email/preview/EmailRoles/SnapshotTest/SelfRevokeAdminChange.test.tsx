import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SelfRevokeAdminChange from "../SelfRevokeAdminChange";

describe("Self Revoke Admin Change Email Snapshot Test", () => {
  it("renders a AppkCMSEmail Preview Template", () => {
    const { asFragment } = render(<SelfRevokeAdminChange />);

    expect(asFragment()).toMatchSnapshot();
  });
});
