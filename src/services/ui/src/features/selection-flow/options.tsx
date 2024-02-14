import { OptionData } from "@/features/selection-flow/plan-types";

export const AUTHORITY_OPTIONS: OptionData[] = [
  {
    title: "State Plan Amendment (SPA)",
    description: "Submit a new Medicaid or CHIP State Plan Amendment",
    linkTo: "/new-submission/spa",
  },
  {
    title: "Waiver Action",
    description:
      "Submit Waivers, Amendments, Renewals, and Temporary Extensions",
    linkTo: "/new-submission/waiver",
  },
];

export const SPA_OPTIONS: OptionData[] = [
  {
    title: "Medicaid SPA",
    description: "Submit a new Medicaid State Plan Amendment",
    linkTo: "/new-submission/spa/medicaid",
  },
  {
    title: "CHIP SPA",
    description: "Submit a new CHIP State Plan Amendment",
    linkTo: "/new-submission/spa/chip",
  },
];

export const MEDICAID_SPA_OPTIONS: OptionData[] = [
  {
    title: "Medicaid Eligibility, Enrollment, Administration, and Health Homes",
    description: "Redirects to the MACPro Appian submission system",
    linkTo: "/new-submission/spa/medicaid/landing/medicaid-eligibility",
  },
  {
    title:
      "Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing",
    description: "Redirects to the MMDL submission system",
    linkTo: "/new-submission/spa/medicaid/landing/medicaid-abp",
  },
  {
    title: "All Other Medicaid SPA Submissions",
    description: "Create a new Medicaid State Plan Amendment",
    linkTo: "/new-submission/spa/medicaid/create",
  },
];

export const CHIP_SPA_OPTIONS: OptionData[] = [
  {
    title: "CHIP Eligibility",
    description: "Redirects to the MMDL submission system",
    linkTo: "/new-submission/spa/chip/landing/chip-eligibility",
  },
  {
    title: "All Other CHIP SPA Submissions",
    description: "Create a new CHIP State Plan Amendment",
    linkTo: "/new-submission/spa/chip/create",
  },
];

export const WAIVER_OPTIONS: OptionData[] = [
  {
    title: "Request Temporary Extension",
    description: "Submit for 1915(b) or 1915(c)",
    linkTo: "/",
  },
  {
    title: "1915(b) Waiver Actions",
    description: "Submit 1915(b) Waivers, Amendments, and Renewals",
    linkTo: "/new-submission/waiver/b",
  },
  {
    title: "1915(c) Appendix K Amendment",
    description: "Create a 1915(c) Appendix K Amendment",
    linkTo: "/",
  },
];

export const B_WAIVER_OPTIONS: OptionData[] = [
  {
    title: "1915(b)(4) FFS Selective Contracting Waivers",
    description:
      "Submit 1915(b)(4) FFS Selective Contracting Waivers, Amendments, and Renewals",
    linkTo: "/new-submission/waiver/b/b4",
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
    linkTo: "/new-submission/waiver/b/capitated",
  },
];

export const B4_WAIVER_OPTIONS: OptionData[] = [
  {
    title: "1915(b)(4) FFS Selective Contracting New Initial Waiver",
    description:
      "Create a new 1915(b)(4) FFS Selective Contracting Initial Waiver",
    linkTo: "/new-submission/waiver/b/b4/initial/create",
  },
  {
    title: "1915(b)(4) FFS Selective Contracting Renewal Waiver",
    description:
      "Renew an existing 1915(b)(4) FFS Selective Contracting Waiver",
    linkTo: "/new-submission/waiver/b/b4/renewal/create",
  },
  {
    title: "1915(b)(4) FFS Selective Contracting Waiver Amendment",
    description:
      "Amend an existing 1915(b)(4) FFS Selective Contracting Waiver",
    linkTo: "/new-submission/waiver/b/b4/amendment/create",
  },
];
export const BCAP_WAIVER_OPTIONS: OptionData[] = [
  {
    title: "1915(b) Comprehensive (Capitated) New Initial Waiver",
    description:
      "Create a new 1915(b) Comprehensive (Capitated) Initial Waiver",
    linkTo: "/new-submission/waiver/b/capitated/initial/create",
  },
  {
    title: "1915(b) Comprehensive (Capitated) Renewal Waiver",
    description: "Renew an existing 1915(b) Comprehensive (Capitated) Waiver",
    linkTo: "/new-submission/waiver/b/capitated/renewal/create",
  },
  {
    title: "1915(b) Comprehensive (Capitated) Waiver Amendment ",
    description: "Amend an existing 1915(b) Comprehensive (Capitated) Waiver",
    linkTo: "/new-submission/waiver/b/capitated/amendment/create",
  },
];
