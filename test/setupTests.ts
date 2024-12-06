import { EventEmitter } from "events";
import { vi, afterEach, beforeEach } from "vitest";

// Increase the default max listeners for EventEmitter
EventEmitter.defaultMaxListeners = 15;

// Example of clearing mocks and listeners in a test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Remove any listeners that were added during tests
  process.removeAllListeners("unhandledRejection");
  process.removeAllListeners("uncaughtException");
});
