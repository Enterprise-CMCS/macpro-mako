import { OptionData } from "@/features/selection-flow/plan-types";
import { ORIGIN, SPA_SUBMISSION_ORIGIN, WAIVER_SUBMISSION_ORIGIN } from "@/utils";

export const AUTHORITY_OPTIONS: OptionData[] = [
  {
    title: "State Plan Amendment (SPA)",
    description: "Submit a new Medicaid or CHIP State Plan Amendment",
    to: "/new-submission/spa",
  },
  {
    title: "Waiver Action",
    description: "Submit Waivers, Amendments, Renewals, and Temporary Extensions",
    to: "/new-submission/waiver",
  },
];

export const SPA_OPTIONS: OptionData[] = [
  {
    title: "Medicaid SPA",
    description: "Submit a new Medicaid State Plan Amendment",
    to: "/new-submission/spa/medicaid",
  },
  {
    title: "CHIP SPA",
    description: "Submit a new CHIP State Plan Amendment",
    to: "/new-submission/spa/chip",
  },
];

export const MEDICAID_SPA_OPTIONS: OptionData[] = [
  {
    title: "Medicaid Eligibility, Enrollment, Administration, and Health Homes",
    description: "Redirects to the MACPro Appian submission system",
    to: "/new-submission/spa/medicaid/landing/medicaid-eligibility",
  },
  {
    title: "All Other Medicaid SPA Submissions",
    description: "Create a new Medicaid State Plan Amendment",
    to: {
      pathname: "/new-submission/spa/medicaid/create",
      search: new URLSearchParams({
        [ORIGIN]: SPA_SUBMISSION_ORIGIN,
      }).toString(),
    },
  },
];

export const CHIP_SPA_OPTIONS: OptionData[] = [
  {
    title: "All Other CHIP SPA Submissions",
    description: "Create a new CHIP State Plan Amendment",
    to: {
      pathname: "/new-submission/spa/chip/create",
      search: new URLSearchParams({
        [ORIGIN]: SPA_SUBMISSION_ORIGIN,
      }).toString(),
    },
  },
];

export const WAIVER_OPTIONS: OptionData[] = [
  {
    title: "Request Temporary Extension",
    description: "Submit for 1915(b) or 1915(c)",
    to: {
      pathname: "/new-submission/waiver/temporary-extensions",
      search: new URLSearchParams({
        [ORIGIN]: WAIVER_SUBMISSION_ORIGIN,
      }).toString(),
    },
  },
  {
    title: "1915(b) Waiver Actions",
    description: "Submit 1915(b) Waivers, Amendments, and Renewals",
    to: "/new-submission/waiver/b",
  },
  {
    title: "1915(c) Appendix K Amendment",
    description: "Create a 1915(c) Appendix K Amendment",
    to: {
      pathname: "/new-submission/waiver/app-k",
      search: new URLSearchParams({
        [ORIGIN]: WAIVER_SUBMISSION_ORIGIN,
      }).toString(),
    },
  },
];

export const B_WAIVER_OPTIONS: OptionData[] = [
  {
    title: "1915(b)(4) FFS Selective Contracting Waivers",
    description: "Submit 1915(b)(4) FFS Selective Contracting Waivers, Amendments, and Renewals",
    to: "/new-submission/waiver/b/b4",
  },
  {
    title: "1915(b) Comprehensive (Capitated) Waiver Authority",
    description: (
      <>
        Submit 1915(b) Comprehensive (Capitated) Waivers, Amendments and Renewals <br />
        <b>
          <em>Not applicable for 1915(b)(4) FFS Selective Contracting Waiver actions</em>
        </b>
      </>
    ),
    to: "/new-submission/waiver/b/capitated",
  },
];

export const B4_WAIVER_OPTIONS: OptionData[] = [
  {
    title: "1915(b)(4) FFS Selective Contracting New Initial Waiver",
    description: "Create a new 1915(b)(4) FFS Selective Contracting Initial Waiver",
    to: {
      pathname: "/new-submission/waiver/b/b4/initial/create",
      search: new URLSearchParams({
        [ORIGIN]: WAIVER_SUBMISSION_ORIGIN,
      }).toString(),
    },
  },
  {
    title: "1915(b)(4) FFS Selective Contracting Renewal Waiver",
    description: "Renew an existing 1915(b)(4) FFS Selective Contracting Waiver",
    to: {
      pathname: "/new-submission/waiver/b/b4/renewal/create",
      search: new URLSearchParams({
        [ORIGIN]: WAIVER_SUBMISSION_ORIGIN,
      }).toString(),
    },
  },
  {
    title: "1915(b)(4) FFS Selective Contracting Waiver Amendment",
    description: "Amend an existing 1915(b)(4) FFS Selective Contracting Waiver",
    to: {
      pathname: "/new-submission/waiver/b/b4/amendment/create",
      search: new URLSearchParams({
        [ORIGIN]: WAIVER_SUBMISSION_ORIGIN,
      }).toString(),
    },
  },
];
export const BCAP_WAIVER_OPTIONS: OptionData[] = [
  {
    title: "1915(b) Comprehensive (Capitated) New Initial Waiver",
    description: "Create a new 1915(b) Comprehensive (Capitated) Initial Waiver",
    to: {
      pathname: "/new-submission/waiver/b/capitated/initial/create",
      search: new URLSearchParams({
        [ORIGIN]: WAIVER_SUBMISSION_ORIGIN,
      }).toString(),
    },
  },
  {
    title: "1915(b) Comprehensive (Capitated) Renewal Waiver",
    description: "Renew an existing 1915(b) Comprehensive (Capitated) Waiver",
    to: {
      pathname: "/new-submission/waiver/b/capitated/renewal/create",
      search: new URLSearchParams({
        [ORIGIN]: WAIVER_SUBMISSION_ORIGIN,
      }).toString(),
    },
  },
  {
    title: "1915(b) Comprehensive (Capitated) Waiver Amendment ",
    description: "Amend an existing 1915(b) Comprehensive (Capitated) Waiver",
    to: {
      pathname: "/new-submission/waiver/b/capitated/amendment/create",
      search: new URLSearchParams({
        [ORIGIN]: WAIVER_SUBMISSION_ORIGIN,
      }).toString(),
    },
  },
];
