import { FormSchema } from "shared-types";

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
    { title: "Exemptions", sectionId: "exemptions", form: [] },

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
          description:
            "The state may choose to exempt certain groups from cost sharing.",
          descriptionClassName: "text-base",
          slots: [
            {
              rhf: "Select",
              label:
                "Does the state elect to exempt individuals under age 19, 20, or 21 or any reasonable category of individuals age 18 or over? ",
              labelClassName: "font-bold",
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
              labelClassName: "font-bold",
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
                            labelClassName: "font-bold",
                            name: "other-res-cat-describe",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: /^\S(.*\S)?$/,
                                message:
                                  "Must not have leading or trailing whitespace.",
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
              labelClassName: "font-bold",
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
              labelClassName: "font-bold",
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
                            labelClassName: "font-bold",
                            name: "other-ai-an-describe",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: /^\S(.*\S)?$/,
                                message:
                                  "Must not have leading or trailing whitespace.",
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
              labelClassName: "font-bold",
              name: "ai-an-additional-proc-used",
              rules: {
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },

            {
              rhf: "Checkbox",
              name: "identify-exempt-from-cost-share",
              labelClassName: "font-bold",
              label:
                "To identify all other individuals exempt from cost sharing, the state uses:",
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
                    label:
                      "The Eligibility and Enrollment system to flag exempt recipients",
                  },
                  {
                    value: "medicaid_card_to_indicate",
                    label:
                      "The Medicaid card to indicate if a beneficiary is exempt",
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
                            labelClassName: "font-bold",
                            name: "other-exempt-describe",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: /^\S(.*\S)?$/,
                                message:
                                  "Must not have leading or trailing whitespace.",
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
              labelClassName: "font-bold",
              name: "other-exempt-additional-proc-used",
              rules: {
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
              labelClassName: "font-bold",
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
          ],
        },
      ],
    },
  ],
};
