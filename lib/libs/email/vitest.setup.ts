import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";

// If using MSW or other mocks, you could import and initialize here:
import { mockedServer } from "../../../mocks/server";
beforeAll(() => mockedServer.listen());
afterEach(() => mockedServer.resetHandlers());
afterAll(() => mockedServer.close());

afterEach(() => {
  cleanup();
});
