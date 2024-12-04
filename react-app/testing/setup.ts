import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { JSDOM } from "jsdom";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Setup a virtual DOM environment for tests
if (typeof window === "undefined") {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  global.window = dom.window as unknown as Window & typeof globalThis;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
}
