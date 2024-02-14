/**
 * Source of truth for feature flags in application.
 * Ensures some type safety around flag names when we're enabling/disabling features in our code.
 *
 * This file also used to generate types for our Jest unit tests and Cypress tests validation logic.
 */

export const featureFlags = {
  /**
   * Toggles the site maintenance alert on the webforms page
   */
  SITE_UNDER_MAINTENANCE_BANNER: {
    flag: "site-under-maintenance-banner",
    defaultValue: "OFF",
  },

  /**
   * Toggles the clear data button on webforms
   */
  CLEAR_DATA_BUTTON: {
    flag: "clear-data-button",
    defaultValue: false,
  },

  /**
   * Used in testing to simulate errors in fetching flag value.
   * This flag does not exist in LaunchDarkly dashboard so fetching this will return the defaultValue.
   */
  TEST_ERROR_FETCHING_FLAG: {
    flag: "test-error-fetching-flag",
    defaultValue: undefined,
  },
} as const;
