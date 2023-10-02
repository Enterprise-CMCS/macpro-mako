import {ROUTES} from "@/routes";
import {OptionData} from "@/pages/create/create-options";

export const AUTHORITY_OPTIONS: OptionData[] = [
    {
        title: "State Plan Amendment (SPA)",
        description: "Submit a new Medicaid or CHIP State Plan Amendment",
        linkTo: ROUTES.SPA_SUBMISSION_OPTIONS
    },
    {
        title: "Waiver Action",
        description: "Submit Waivers, Amendments, Renewals, and Temporary Extensions",
        linkTo: ROUTES.DASHBOARD
    },
];

export const SPA_OPTIONS: OptionData[] = [
    {
        title: "Medicaid SPA",
        description: "Submit a new Medicaid State Plan Amendment",
        linkTo: ROUTES.CREATE
    },
    {
        title: "CHIP SPA",
        description: "Submit a new CHIP State Plan Amendment",
        linkTo: ROUTES.DASHBOARD
    },
];

export const MEDICAID_SPA_OPTIONS: OptionData[] = [
    {
        title: "Medicaid Eligibility, Enrollment, Administration, and Health Homes",
        description: "Redirects to the MACPro Appian submission system",
        linkTo: ROUTES.DASHBOARD // TODO: Landing page route
    },
    {
        title: "Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing",
        description: "Redirects to the MMDL submission system",
        linkTo: ROUTES.DASHBOARD // TODO: Landing page route
    },
    {
        title: "All Other Medicaid SPA Submissions",
        description: "Create a new Medicaid State Plan Amendment",
        linkTo: ROUTES.CREATE
    },
];

export const CHIP_SPA_OPTIONS: OptionData[] = [
    {
        title: "CHIP Eligibility",
        description: "Redirects to the MMDL submission system",
        linkTo: ROUTES.DASHBOARD // TODO: Landing page route
    },
    {
        title: "All Other CHIP SPA Submissions",
        description: "Create a new CHIP State Plan Amendment",
        linkTo: ROUTES.CREATE
    },
];
