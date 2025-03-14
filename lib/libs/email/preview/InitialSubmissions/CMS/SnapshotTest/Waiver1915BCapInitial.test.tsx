import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CMSWaiver1915bCapitatedInitial from "../Waiver1915bCapitated/Initial";

describe("Initial Submission CMS Email Snapshot Test", () => {
  it("renders a Initial Waiver Capitated Preview Template", () => {
    const { asFragment } = render(<CMSWaiver1915bCapitatedInitial />);

    expect(asFragment()).toMatchSnapshot();
  });
});
