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
   * Toggles the legacy FAQ and oneMAC support page
   */
  TOGGLE_FAQ: {
    flag: "toggleFaq",
    defaultValue: false,
  },
  /**
   * Toggles the visibility of the MMDL Alert Banner
   */
  UAT_HIDE_MMDL_BANNER: {
    flag: "uat-hide-mmdl-banner",
    defaultValue: "OFF",
  },
  /**
   * Toggles the visibility of the CMS Homepage
   */
  CMS_HOMEPAGE_FLAG: {
    flag: "cms-home-page",
    defaultValue: "OFF",
  },
  /**
   * Toggles the visibility of the STATE Homepage
   */
  STATE_HOMEPAGE_FLAG: {
    flag: "state-home-page",
    defaultValue: "OFF",
  },
  /*
   * Toggle visibility of login feature page
   */
  LOGIN_PAGE: {
    flag: "login-page",
    defaultValue: true,
  },
  /*
   * Toggle visibility of chip spa submission page
   */
  CHIP_SPA_SUBMISSION: {
    flag: "chip-spa-submission",
    defaultValue: true,
  },
  /*
   *  Toggle visibility of webform tab
   */
  WEBFORM_TAB_VISIBLE: {
    flag: "webform-tab",
    defaultValue: true,
  },
  /*
   *  Toggle visibility of mmdl medspa card
   */
  MED_SPA_CARD: {
    flag: "med-spa-card",
    defaultValue: true,
  },
  /*
   *  Toggle visibility of save and submit form
   */
  MED_SPA_FOOTER: {
    flag: "med-spa-footer",
    defaultValue: true,
  },
  /*
   *  Toggle visibility of details page of the chip spa eligibility submission
   */
  CHIP_SPA_DETAILS: {
    flag: "chip-spa-details",
    defaultValue: true,
  },
  /*
   * Toggle CS31 CHIP SPA template asset between environments
   */
  CS31_ALT: {
    flag: "cs31-alt",
    defaultValue: false,
  },
  /*
   *  Toggle visibility between the enhanced experience and mmdl banner
   */
  UPGRADE_MMDL_BANNER: {
    flag: "upgrade-mmdl-banner",
    defaultValue: true,
  },
  /*
   *  Toggle visibility between new and old user role UI's
   */
  SHOW_USER_ROLE_UPDATE: {
    flag: "show-user-role-updates",
    defaultValue: false,
  },
  /*
   *  Toggle visibility between the new and upgrade faq labels
   */
  UPGRADE_NEW_LABEL: {
    flag: "upgade-new-label",
    defaultValue: true,
  },
  /*
   *  Toggle visibility of SMART link in header
   */
  SHOW_SMART_LINK: {
    flag: "show-smart-link",
    defaultValue: false,
  },
} as const;
