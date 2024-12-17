import { describe, it, expect } from "vitest";
import AppKCMSEmailPreview from "./AppK";
import { JSDOM } from "jsdom";
import { render } from "@testing-library/react";
let dom: JSDOM;
describe("AppKCMSEmailPreview Snapshot Test", () => {
  it("renders the AppKCMSEmailPreview component correctly", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    global.document = dom.window.document;
    global.window = dom.window;

    const { asFragment } = render(<AppKCMSEmailPreview />);
    expect(asFragment()).toMatchSnapshot();
  });
});
