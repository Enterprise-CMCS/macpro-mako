/**
 * Source of truth for feature flags in application.
 * Ensures some type safety around flag names when we're enabling/disabling features in our code.
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
   * Toggles the visibility of the MMDL Alert Banner
   */
  UAT_HIDE_MMDL_BANNER: {
    flag: "uat-hide-mmdl-banner",
    defaultValue: "OFF", //Default to visible
  },
} as const;
