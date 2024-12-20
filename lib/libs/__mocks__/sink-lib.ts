import { vi } from "vitest";

export const logError = vi.fn();
export const bulkUpdateDataWrapper = vi.fn(() => Promise.resolve());
