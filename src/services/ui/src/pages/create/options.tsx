import { ROUTES } from "@/routes";
import { OptionData } from "@/pages/create/create-options";

export const AUTHORITY_OPTIONS: OptionData[] = [
  {
    title: "State Plan Amendment (SPA)",
    description: "Submit a new Medicaid or CHIP State Plan Amendment",
    linkTo: ROUTES.SPA_SUBMISSION_OPTIONS,
  },
  {
    title: "Waiver Action",
    description:
      "Submit Waivers, Amendments, Renewals, and Temporary Extensions",
    linkTo: ROUTES.WAIVER_SUBMISSION_OPTIONS,
  },
];

export const SPA_OPTIONS: OptionData[] = [
  {
    title: "Medicaid SPA",
    description: "Submit a new Medicaid State Plan Amendment",
    linkTo: ROUTES.MEDICAID_SPA_SUB_OPTIONS,
  },
  {
    title: "CHIP SPA",
    description: "Submit a new CHIP State Plan Amendment",
    linkTo: ROUTES.CHIP_SPA_SUB_OPTIONS,
  },
];

export const MEDICAID_SPA_OPTIONS: OptionData[] = [
  {
    title: "Medicaid Eligibility, Enrollment, Administration, and Health Homes",
    description: "Redirects to the MACPro Appian submission system",
    linkTo: ROUTES.MEDICAID_ELIGIBILITY_LANDING,
  },
  {
    title:
      "Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing",
    description: "Redirects to the MMDL submission system",
    linkTo: ROUTES.MEDICAID_ABP_LANDING,
  },
  {
    title: "All Other Medicaid SPA Submissions",
    description: "Create a new Medicaid State Plan Amendment",
    linkTo: ROUTES.CREATE,
  },
];

export const CHIP_SPA_OPTIONS: OptionData[] = [
  {
    title: "CHIP Eligibility",
    description: "Redirects to the MMDL submission system",
    linkTo: ROUTES.CHIP_ELIGIBILITY_LANDING,
  },
  {
    title: "All Other CHIP SPA Submissions",
    description: "Create a new CHIP State Plan Amendment",
    linkTo: ROUTES.CREATE,
  },
];

export const WAIVER_OPTIONS: OptionData[] = [
  {
    title: "Request Temporary Extension",
    description: "Submit for 1915(b) or 1915(c)",
    linkTo: ROUTES.CREATE,
  },
  {
    title: "1915(b) Waiver Actions",
    description: "Submit 1915(b) Waivers, Amendments, and Renewals",
    linkTo: ROUTES.B_WAIVER_SUBMISSION_OPTIONS,
  },
  {
    title: "1915(c) Appendix K Amendment",
    description: "Create a 1915(c) Appendix K Amendment",
    linkTo: ROUTES.CREATE,
  },
];

export const B_WAIVER_OPTIONS: OptionData[] = [
  {
    title: "1915(b)(4) FFS Selective Contracting Waivers",
    description:
      "Submit 1915(b)(4) FFS Selective Contracting Waivers, Amendments, and Renewals",
    linkTo: ROUTES.B4_WAIVER_OPTIONS,
  },
  {
    title: "1915(b) Comprehensive (Capitated) Waiver Authority",
    description: (
      <>
        Submit 1915(b) Comprehensive (Capitated) Waivers, Amendments and
        Renewals <br />
        <b>
          <em>
            Not applicable for 1915(b)(4) FFS Selective Contracting Waiver
            actions
          </em>
        </b>
      </>
    ),
    linkTo: ROUTES.BCAP_WAIVER_OPTIONS,
  },
];

export const B4_WAIVER_OPTIONS: OptionData[] = [
  {
    title: "1915(b)(4) FFS Selective Contracting New Initial Waiver",
    description:
      "Create a new 1915(b)(4) FFS Selective Contracting Initial Waiver",
    linkTo: ROUTES.DASHBOARD,
  },
  {
    title: "1915(b)(4) FFS Selective Contracting Renewal Waiver",
    description:
      "Renew an existing 1915(b)(4) FFS Selective Contracting Waiver",
    linkTo: ROUTES.DASHBOARD,
  },
  {
    title: "1915(b)(4) FFS Selective Contracting Waiver Amendment",
    description:
      "Amend an existing 1915(b)(4) FFS Selective Contracting Waiver",
    linkTo: ROUTES.DASHBOARD,
  },
];
export const BCAP_WAIVER_OPTIONS: OptionData[] = [
  {
    title: "1915(b) Comprehensive (Capitated) New Initial Waiver",
    description:
      "Create a new 1915(b) Comprehensive (Capitated) Initial Waiver",
    linkTo: ROUTES.DASHBOARD,
  },
  {
    title: "1915(b) Comprehensive (Capitated) Renewal Waiver",
    description: "Renew an existing 1915(b) Comprehensive (Capitated) Waiver",
    linkTo: ROUTES.DASHBOARD,
  },
  {
    title: "1915(b) Comprehensive (Capitated) Waiver Amendment ",
    description: "Amend an existing 1915(b) Comprehensive (Capitated) Waiver",
    linkTo: ROUTES.DASHBOARD,
  },
];
