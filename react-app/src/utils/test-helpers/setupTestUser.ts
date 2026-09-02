import userEvent, { type Options } from "@testing-library/user-event";

/**
 * Creates a user-event session without zero-delay timer yields in CI.
 *
 * Interaction-heavy tests can otherwise spend seconds waiting for each
 * setTimeout(0) on constrained GitHub runners. Local tests retain user-event's
 * normal scheduling so timing-sensitive behavior is still exercised.
 */
export const setupTestUser = (options?: Options) =>
  userEvent.setup({ ...(process.env.CI ? { delay: null } : {}), ...options });
