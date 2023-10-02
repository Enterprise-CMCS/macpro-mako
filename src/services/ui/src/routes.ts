/** TODO: Implement enum values where `to` or `href` is currently just a string. */
export enum ROUTES {
    HOME = "/",
    DASHBOARD = "/dashboard",
    DETAILS = "/details",
    FAQ = "/faq",
    // New Submission Routes
    // Can stand to be reduced with dynamic segments (KH)
    NEW_SUBMISSION_OPTIONS = "/new-submission",
    SPA_SUBMISSION_OPTIONS = "/new-submission/spa",
    MEDICAID_SPA_SUB_OPTIONS = "/new-submission/spa/medicaid",
    CHIP_SPA_SUB_OPTIONS = "/new-submission/spa/chip",
    MEDICAID_ABP_LANDING = "/landing/medicaid-abp",
    MEDICAID_ELIGIBILITY_LANDING = "/landing/medicaid-eligibility",
    CHIP_ELIGIBILITY_LANDING = "/landing/chip-eligibility",
    CREATE = "/create"
}
