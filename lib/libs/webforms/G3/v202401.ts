import { FormSchema } from "shared-types";
import { noLeadingTrailingWhitespace } from "shared-utils/regex";

export const v202401: FormSchema = {
  header: "Premiums and cost sharing G3: Limitations",
  subheader: "42 CFR 447.56 | 1916 | 1916A",
  formId: "g3",
  sections: [
    {
      title: "Overview",
      sectionId: "overview",
      form: [
        {
          slots: [
            {
              name: "state-admin-prem-and-cost-share-in-accordance",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "true",
                    label:
                      "The state administers premiums and cost sharing in accordance with the limitations described at 42 CFR 447.56, as well as at 1916(a)(2) and (j) and 1916A(b) of the Social Security Act (SSA).",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Exemptions",
      sectionId: "exemptions",
      form: [],
    },
    {
      title: "Groups of individuals—Mandatory exemptions",
      sectionId: "exemptions-group-indiv-manda",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "cost-shar-less-than-agency-pays",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    styledLabel: [
                      {
                        text: "The state assures that it does not impose cost sharing on the following groups:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Individuals age 1 and older and under age 18 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "B. 	Infants under age 1 eligible under the “infants and children under age 18” eligibility group (42 CFR 435.118) whose income does not exceed the higher of:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	133% of the federal poverty level (FPL)",
                        type: "default",
                        classname: "block py-1 px-6",
                      },
                      {
                        text: "• 	If applicable, the percent FPL described in Section 1902(l)(2)(A)(iv) of the Act, up to 185% FPL",
                        type: "default",
                        classname: "block py-1 px-6",
                      },
                      {
                        text: "C. 	Disabled or blind individuals under age 18 eligible for the following eligibility groups:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	SSI beneficiaries (42 CFR 435.120)",
                        type: "default",
                        classname: "block py-1 px-6",
                      },
                      {
                        text: "• 	Blind and disabled individuals in 209(b) states (42 CFR 435.121)",
                        type: "default",
                        classname: "block py-1 px-6",
                      },
                      {
                        text: "• 	Individuals receiving mandatory state supplements (42 CFR 435.130)",
                        type: "default",
                        classname: "block py-1 px-6",
                      },
                      {
                        text: "D. 	Children for whom child welfare services are made available under Part B of Title IV of the Act on the basis of being a child in foster care, as well as individuals receiving benefits under Part E of that title, without regard to age",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "E. 	Disabled children eligible for Medicaid under the Family Opportunity Act (1902(a)(10)(A)(ii)(XIX) and 1902(cc) of the Act)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "F. 	Pregnant women, during pregnancy and through the postpartum period that begins on the last day of pregnancy and extends through the end of the month in which the 60-day period following termination of pregnancy ends, except for cost sharing for services specified in the state plan as not pregnancy-related",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "G. 	Any individual whose medical assistance for services furnished in an institution is reduced by amounts reflecting available income other than required for personal needs",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "H. 	An individual receiving hospice care, as defined in Section 1905(o) of the Act",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "I. 	Indians who are currently receiving or have ever received an item or service furnished by an Indian health care provider or through referral under contract health services",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "J. 	Individuals who are receiving Medicaid because of the state's election to extend coverage to the “certain individuals needing treatment for breast or cervical cancer” eligibility group (42 CFR 435.213)",
                        type: "default",
                        classname: "block py-1",
                      },
                    ],
                    value: "true",
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "Groups of individuals—Optional exemptions",
      sectionId: "exemptions-group-indiv-option",
      subsection: true,
      form: [
        {
          description: "The state may choose to exempt certain groups from cost sharing.",
          descriptionClassName: "text-base",
          slots: [
            {
              rhf: "Select",
              label:
                "Does the state elect to exempt individuals under age 19, 20, or 21 or any reasonable category of individuals age 18 or over? ",
              labelClassName: "font-bold text-black",
              name: "state-elect-exempt-under-age",
              rules: { required: "* Required" },
              props: {
                className: "w-[125px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              rhf: "Radio",
              label: "Age of exemption",
              labelClassName: "font-bold text-black",
              name: "age-of-exempt",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label: "Under age 19",
                    value: "under_19",
                  },
                  {
                    label: "Under age 20",
                    value: "under_20",
                  },
                  {
                    label: "Under age 21",
                    value: "under_21",
                  },
                  {
                    label: "Other reasonable category",
                    value: "other_res_cat",
                    form: [
                      {
                        slots: [
                          {
                            rhf: "Textarea",
                            label: "Describe",
                            labelClassName: "font-bold text-black",
                            name: "other-res-cat-describe",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message: "Must not have leading or trailing whitespace.",
                              },
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },

            {
              rhf: "Select",
              label:
                "Does the state elect to exempt individuals whose medical assistance for services furnished in a home and community-based setting is reduced by amounts reflecting available income other than required for personal needs?",
              labelClassName: "font-bold text-black",
              name: "state-elect-exempt-medical-assist",
              rules: { required: "* Required" },
              props: {
                className: "w-[125px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "Services—Mandatory exemptions",
      sectionId: "service-manda-exemptions",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "state-assures-not-impose-cost-share",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    styledLabel: [
                      {
                        text: "The state assures that it does not impose cost sharing for the following services:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. 	Emergency services as defined at Section 1932(b)(2) of the Act and 42 CFR 438.114(a)",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "B. 	Family planning services and supplies described in Section 1905(a)(4)(C) of the Act, including contraceptives and pharmaceuticals for which the state claims or could claim federal match at the enhanced rate under Section 1903(a)(5) of the Act for family planning services and supplies",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "C. 	Preventive services, at a minimum the services specified at 42 CFR 457.520, provided to children under age 18 regardless of family income, that reflect the well-baby and well-child care and immunizations in the Bright Futures guidelines issued by the American Academy of Pediatrics",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "D. 	Pregnancy-related services, including those defined at 42 CFR 440.210(a)(2) and 440.250(p), and counseling and drugs for cessation of tobacco use, with all services provided to pregnant women considered to be pregnancy-related, except services specifically identified in the state plan as not being related to pregnancy",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "E. 	Provider-preventable services as defined in 42 CFR 447.26(b)",
                        type: "default",
                        classname: "block py-1",
                      },
                    ],
                    value: "true",
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "Enforceability of exemptions",
      sectionId: "enforceable-exemptions",
      subsection: true,
      form: [
        {
          description:
            "The state uses the following procedures for implementing and enforcing the exemptions from premiums and cost sharing contained in 42 CFR 447.56.",
          descriptionClassName: "text-base",
          slots: [
            {
              rhf: "Checkbox",
              name: "identify-ai-an-receiving-item-service",
              labelClassName: "font-bold text-black",
              label:
                "To identify that American Indians/Alaskan Natives (AI/AN) are currently receiving or have ever received an item or service furnished by an Indian health care provider or through referral under contract health services in accordance with 42 CFR 447.56(a)(1)(x), the state:",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "accepts_self_attest",
                    label: "Accepts self-attestation",
                  },
                  {
                    value: "runs_period_claims_reviews",
                    label: "Runs periodic claims reviews",
                  },
                  {
                    value: "obtain_letter_ihs_doc",
                    label:
                      "Obtains an active or previous user letter or other Indian Health Service (IHS) document",
                  },
                  {
                    value: "use_eligi_enroll_sys_and_mmis",
                    label:
                      "Uses the Eligibility and Enrollment system and MMIS to flag exempt recipients",
                  },
                  {
                    value: "other",
                    label: "Other",
                    form: [
                      {
                        slots: [
                          {
                            rhf: "Textarea",
                            label: "Describe",
                            labelClassName: "font-bold text-black",
                            name: "other-ai-an-describe",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message: "Must not have leading or trailing whitespace.",
                              },
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "Textarea",
              label: "Additional procedures used (optional)",
              labelClassName: "font-bold text-black",
              name: "ai-an-additional-proc-used",
              rules: {
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },

            {
              rhf: "Checkbox",
              name: "identify-exempt-from-cost-share",
              labelClassName: "font-bold text-black",
              formItemClassName: "border-slate-300 border-t-2 mt-2",
              label: "To identify all other individuals exempt from cost sharing, the state uses:",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "mmis_to_flag",
                    label: "MMIS to flag exempt recipients",
                  },
                  {
                    value: "eligibility_and_enroll_sys",
                    label: "The Eligibility and Enrollment system to flag exempt recipients",
                  },
                  {
                    value: "medicaid_card_to_indicate",
                    label: "The Medicaid card to indicate if a beneficiary is exempt",
                  },
                  {
                    value: "use_eligi_verif_system",
                    label:
                      "The Eligibility Verification system to notify providers when a beneficiary is exempt",
                  },
                  {
                    value: "other",
                    label: "Other",
                    form: [
                      {
                        slots: [
                          {
                            rhf: "Textarea",
                            label: "Describe",
                            labelClassName: "font-bold text-black",
                            name: "other-exempt-describe",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message: "Must not have leading or trailing whitespace.",
                              },
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "Textarea",
              label: "Additional procedures used (optional)",
              labelClassName: "font-bold text-black",
              name: "other-exempt-additional-proc-used",
              rules: {
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
          ],
        },
      ],
    },

    {
      title: "Payments to providers",
      sectionId: "cost-shar-for-non-emergency",
      form: [
        {
          slots: [
            {
              name: "state-reduces-pay-to-provider-by-cost-share-obligat",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "true",
                    label:
                      "The state reduces the payment it makes to a provider by the amount of a beneficiary's cost-sharing obligation, regardless of whether the provider has collected the payment or waived the cost sharing, except as provided under 42 CFR 447.56(c).",
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "Payments to managed care organizations (MCOs)",
      sectionId: "addtnl-info",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label:
                "Does the state contract with one or more managed care organizations (MCOs) to deliver services under Medicaid?",
              labelClassName: "font-bold text-black",
              name: "state-contract-mcos-to-deliver-serv",
              rules: { required: "* Required" },
              props: {
                className: "w-[125px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              name: "state-calc-pay-to-mcos-include-cost-share",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "true",
                    label:
                      "The state calculates its payments to MCOs to include cost sharing established under the state plan for beneficiaries not exempt from cost sharing, regardless of whether the organization imposes the cost sharing on its recipient members or the cost sharing is collected.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "Aggregate limits",
      sectionId: "agg-limits",
      form: [
        {
          slots: [
            {
              name: "prem-and-cost-do-not-exceed-5%-agg-limit",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "true",
                    label:
                      "Medicaid premiums and cost sharing incurred by all individuals in the Medicaid household do not exceed an aggregate limit of 5% of the family’s income applied on a quarterly or monthly basis.",
                  },
                ],
              },
            },
            {
              rhf: "Input",
              label:
                "Percentage of family income used for aggregate limit (must be between 0% and 5%)",
              labelClassName: "font-bold text-black",
              name: "percent-fam-income-used-for-agg",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^(?:[0-4](?:\.[0-9])?|5(?:\.0)?|\.[0-9])$/,
                  message: "Must be between 0% and 5% with max one decimal place",
                },
              },
              props: {
                className: "w-[229px]",
                icon: "%",
                iconRight: true,
              },
            },

            {
              rhf: "Radio",
              label:
                "Basis on which the state calculates family income for the purpose of the aggregate limit",
              labelClassName: "font-bold text-black",
              name: "basis-state-calc-agg-limit",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label: "Quarterly",
                    value: "quarterly",
                  },
                  {
                    label: "Monthly",
                    value: "monthly",
                  },
                ],
              },
            },

            {
              rhf: "Select",
              label:
                "Does the state have a process to track each family’s incurred premiums and cost sharing through a mechanism that does not rely on beneficiary documentation?",
              labelClassName: "font-bold text-black",
              name: "does-state-track-fam-incur-prem-and-cost-share",
              rules: { required: "* Required" },
              props: {
                className: "w-[125px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            // yes option
            {
              rhf: "Checkbox",
              name: "how-does-state-track-incurred-prems-and-cost",
              label: "How does the state track each family’s incurred premiums and cost sharing?",
              labelClassName: "font-bold text-black",
              formItemClassName: "ml-[0.6rem] px-4 mt-2 border-l-4 border-l-primary",
              dependency: {
                conditions: [
                  {
                    name: "g3_agg-limits_does-state-track-fam-incur-prem-and-cost-share",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "As claims are submitted for dates of services within the family's current monthly or quarterly cap period, the state applies the incurred cost sharing for that service to the family's aggregate limit. Once the family reaches the aggregate limit, based on incurred cost sharing and any applicable premiums, the state notifies the family and providers that the family has reached its aggregate limit for the current monthly or quarterly cap period and is no longer subject to premiums or cost sharing.",
                    value: "claims_are_submitted_for_dates",
                  },
                  {
                    label: "MCOs track each family’s incurred cost sharing.",
                    value: "mco_track_each_family",
                    form: [
                      {
                        slots: [
                          {
                            rhf: "Textarea",
                            label: "Describe",
                            labelClassName: "font-bold text-black",
                            name: "state-track-mco-desc",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message: "Must not have leading or trailing whitespace.",
                              },
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    label: "Other",
                    value: "other",
                    form: [
                      {
                        slots: [
                          {
                            rhf: "Textarea",
                            label: "Describe",
                            labelClassName: "font-bold text-black",
                            name: "state-track-other-desc",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message: "Must not have leading or trailing whitespace.",
                              },
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "Textarea",
              label:
                "How does the state inform beneficiaries and providers of the beneficiaries' aggregate family limit? How does the state notify beneficiaries and providers when a beneficiary has incurred premiums and cost sharing up to the aggregate family limit and that individual family members are no longer subject to premiums or cost sharing for the remainder of the family's current monthly or quarterly cap period?",
              labelClassName: "font-bold text-black",
              formItemClassName: "ml-[0.6rem] px-4 mb-2 border-l-4 border-l-primary",
              name: "how-state-bene-agg-fam-limit",
              dependency: {
                conditions: [
                  {
                    name: "g3_agg-limits_does-state-track-fam-incur-prem-and-cost-share",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },

            // end yes option
            {
              rhf: "Textarea",
              label:
                "Explain how the state's premium and cost sharing rules do not place beneficiaries at risk of reaching the aggregate family limit.",
              labelClassName: "font-bold text-black",
              formItemClassName: "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
              name: "explain-state-prem-cost-share-dont-place-risk",
              dependency: {
                conditions: [
                  {
                    name: "g3_agg-limits_does-state-track-fam-incur-prem-and-cost-share",
                    type: "expectedValue",
                    expectedValue: "no",
                  },
                ],
                effect: { type: "show" },
              },
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },

            {
              rhf: "Select",
              label:
                "Does the state have a documented appeals process for families that believe they have incurred premiums or cost sharing over the aggregate limit for the current monthly or quarterly cap period?",
              labelClassName: "font-bold text-black",
              name: "does-state-doc-appeals",
              rules: { required: "* Required" },
              props: {
                className: "w-[125px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },

            {
              rhf: "Textarea",
              label: "Describe",
              labelClassName: "font-bold text-black",
              formItemClassName: "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
              dependency: {
                conditions: [
                  {
                    name: "g3_agg-limits_does-state-doc-appeals",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
              name: "does-state-doc-appeals-other",
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },

            {
              rhf: "Textarea",
              label:
                "What is the process for reimbursing beneficiaries and/or providers if the family is identified as paying over the aggregate limit for the month/quarter?",
              labelClassName: "font-bold text-black",
              name: "process-reimburse-over-agg-limit",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },

            {
              rhf: "Textarea",
              label:
                "What is the process for beneficiaries to request a reassessment of their family aggregate limit if they have a change in circumstances or if they are being terminated for failure to pay a premium?",
              labelClassName: "font-bold text-black",
              name: "process-for-reimbirse-reqiest-reassess",
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },

            {
              rhf: "Select",
              label:
                "Does the state impose additional aggregate limits, consistent with 42 CFR 447.56(f)(5)?",
              labelClassName: "font-bold text-black",
              name: "does-state-impose-add-agg-limits",
              rules: { required: "* Required" },
              props: {
                className: "w-[125px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },

            {
              rhf: "Textarea",
              label: "Describe",
              labelClassName: "font-bold text-black",
              formItemClassName: "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
              dependency: {
                conditions: [
                  {
                    name: "g3_agg-limits_does-state-impose-add-agg-limits",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
              name: "does-state-impose-add-agg-limits-other",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
