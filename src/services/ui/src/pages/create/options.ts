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
