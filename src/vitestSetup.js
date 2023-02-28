import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";

// extends Vitest's expect method with methods from react-testing-library
import { JSDOM } from "@testing-library/jest-dom";
expect.extend(matchers);
global.document = new JSDOM("");
global.window = document.defaultView;
global.Image = window.Image;

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
