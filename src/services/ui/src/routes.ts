/** TODO: Implement enum values where `to` or `href` is currently just a string. */
export enum ROUTES {
  HOME = "/",
  DASHBOARD = "/dashboard",
  DETAILS = "/details",
  FAQ = "/faq",
  PROFILE = "/profile",
  // New Submission Routes
  // Can stand to be reduced with dynamic segments (KH)
  NEW_SUBMISSION_OPTIONS = "/new-submission",
  SPA_SUBMISSION_OPTIONS = "/new-submission/spa",
  MEDICAID_SPA_SUB_OPTIONS = "/new-submission/spa/medicaid",
  CHIP_SPA_SUB_OPTIONS = "/new-submission/spa/chip",
  WAIVER_SUBMISSION_OPTIONS = "/new-submission/waiver",
  B_WAIVER_SUBMISSION_OPTIONS = "/new-submission/waiver/b",
  B4_WAIVER_OPTIONS = "/new-submission/waiver/b/b4",
  BCAP_WAIVER_OPTIONS = "/new-submission/waiver/b/capitated",
  MEDICAID_ABP_LANDING = "/new-submission/spa/medicaid/landing/medicaid-abp",
  MEDICAID_ELIGIBILITY_LANDING = "/new-submission/spa/medicaid/landing/medicaid-eligibility",
  CHIP_ELIGIBILITY_LANDING = "/new-submission/spa/chip/landing/chip-eligibility",
  ACTION = "/action/:id/:type",
  CREATE = "/create",
  MEDICAID_NEW = "/new-submission/spa/medicaid/create",
  CHIP_NEW = "/new-submission/spa/chip/create",
  WEBFORMS = "/webforms",
  WEBFORM = "/webform/:id/:version",
  GUIDES = "/guides",
  IMPLEMENTATION_GUIDE = "/guides/implementation",
}

export enum FAQ_SECTION {
  SYSTEM = "system",
}

export const FAQ_TARGET = "faq-target" as const;
