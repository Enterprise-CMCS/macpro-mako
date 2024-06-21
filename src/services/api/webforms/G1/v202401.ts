import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header: "Premiums and cost sharing G1: Cost-sharing requirements",
  formId: "g1",
  sections: [
    {
      title: "Overview",
      sectionId: "overview",
      form: [
        {
          slots: [
            {
              name: "state-charge-cost-sharing",
              rhf: "Select",
              rules: { required: "* Required" },
              label:
                "Does the state charge cost sharing (deductibles, coinsurance, or copayments) to individuals covered under Medicaid?",
              labelClassName: "font-bold",
              props: {
                className: "w-[125px]",
                options: [
                  {
                    value: "yes",
                    label: "Yes",
                  },
                  {
                    value: "no",
                    label: "No",
                  },
                ],
              },
            },
            {
              name: "assures-admin-cost-share",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "accordance_with_sections_1916_and_1916a",
                    label:
                      "The state assures that it administers cost sharing in accordance with Sections 1916 and 1916A of the Social Security Act and 42 CFR 447.50 through 447.57 (excluding 447.55).",
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "General provisions",
      sectionId: "general-provis",
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
                    label:
                      "The cost-sharing amounts established by the state for services are always less than the amounts the agency pays for the service.",
                    value: "true",
                  },
                ],
              },
            },
            {
              rhf: "Checkbox",
              name: "no-prov-may-deny-based-on-pay-cost-except-by-state",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "No provider may deny services to an eligible individual based on the individual’s inability to pay cost sharing, except as elected by the state in accordance with 42 CFR 447.52(e)(1).",
                    value: "true",
                  },
                ],
              },
            },
            {
              rhf: "Checkbox",
              name: "mcos-provides-chargers-in-accordance-with-specified-in-state-plan",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "Contracts with managed care organizations (MCOs) provide that any cost-sharing charges the MCO imposes on Medicaid enrollees are in accordance with the cost sharing specified in the state plan and the requirements of 42 CFR 447.50 through 447.57.",
                    value: "true",
                  },
                ],
              },
            },
            {
              rhf: "Checkbox",
              name: "state-process-to-inform-cost-shar-for-item-or-serv",
              label:
                "What is the state’s process to inform providers whether cost sharing for a specific item or service may be imposed on a beneficiary and whether the provider requires the beneficiary to pay the cost-sharing charge as a condition for receiving the item or service?",
              labelClassName: "font-bold",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state includes an indicator in the Medicaid Management Information System (MMIS).",
                    value: "includes_indicator_in_mmis",
                  },
                  {
                    label:
                      "The state includes an indicator in the Eligibility and Enrollment system.",
                    value: "includes_indicator_in_eligi_enroll_system",
                  },
                  {
                    label:
                      "The state includes an indicator in the Eligibility Verification system.",
                    value: "includes_indicator_in_eligi_verfi_system",
                  },
                  {
                    label:
                      "The state includes an indicator on the Medicaid card, which the beneficiary presents to the provider.",
                    value: "includes_indicator_in_medicaid_card",
                  },
                  {
                    label: "Other process",
                    value: "other",
                    slots: [
                      {
                        name: "other-process-describe",
                        rhf: "Textarea",
                        label: "Describe",
                        labelClassName: "font-bold",
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title:
        "Cost sharing for non-emergency services provided in a hospital emergency department",
      sectionId: "cost-shar-for-non-emergency",
      form: [
        {
          slots: [
            {
              name: "state-charge-cost-shar-for-non-emergen-in-hospital",
              rhf: "Select",
              rules: { required: "* Required" },
              label:
                "Does the state impose cost sharing for non-emergency services provided in a hospital emergency department?",
              labelClassName: "font-bold",
              props: {
                className: "w-[125px]",
                options: [
                  {
                    value: "yes",
                    label: "Yes",
                  },
                  {
                    value: "no",
                    label: "No",
                  },
                ],
              },
            },

            {
              name: "ensures-provide-non-emergenc-impose-cost-shar",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "true",
                    styledLabel: [
                      {
                        text: "The state ensures that before providing non-emergency services and imposing cost sharing for such services, the hospitals providing care:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	Conduct an appropriate medical screening under 42 CFR 489.24, Subpart G to determine that the individual does not need emergency services",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	Inform the individual of the amount of his or her cost-sharing obligation for non-emergency services provided in the emergency department",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	Provide the individual with the name and location of an available and accessible alternative non-emergency services provider",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	Determine that the alternative provider can provide services to the individual in a timely manner with the imposition of a lesser cost-sharing amount or no cost sharing if the individual is otherwise exempt from cost sharing",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	Provide a referral to coordinate scheduling for treatment by the alternative provider",
                        type: "default",
                        classname: "block py-1",
                      },
                    ],
                  },
                ],
              },
            },
            {
              name: "assures-process-identi-hospital-service-as-non-emergenc",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "true",
                    label:
                      "The state assures it has a process in place to identify hospital emergency department services as non-emergency for the purpose of imposing cost sharing. This process does not limit a hospital's obligations for screening and stabilizing treatment of an emergency medical condition under Section 1867 of the Act or modify any obligations under either state or federal standards relating to the application of a prudent-layperson standard for payment or coverage of emergency medical services by any MCO.",
                  },
                ],
              },
            },
            {
              name: "assures-describe",
              rhf: "Textarea",
              rules: { required: "* Required" },
              label: "Describe the process.",
              labelClassName: "font-bold",
              formItemClassName: "pl-9",
            },
          ],
        },
      ],
    },
    {
      title: "Cost sharing for drugs",
      sectionId: "cost-shar-for-drugs",
      form: [
        {
          slots: [
            {
              name: "state-charge-cost-shar-to-individ-under-medicaid",
              rhf: "Select",
              rules: { required: "* Required" },
              label:
                "Does the state charge cost sharing (deductibles, coinsurance, or copayments) to individuals covered under Medicaid?",
              labelClassName: "font-bold",
              props: {
                className: "w-[125px]",
                options: [
                  {
                    value: "yes",
                    label: "Yes",
                  },
                  {
                    value: "no",
                    label: "No",
                  },
                ],
              },
            },
            {
              name: "state-estab-differ-cost-shar-for-prefer-and-non-prefer",
              rhf: "Select",
              rules: { required: "* Required" },
              label:
                "Has the state established differential cost sharing for preferred and non-preferred drugs?",
              labelClassName: "font-bold",
              props: {
                className: "w-[125px]",
                options: [
                  {
                    value: "yes",
                    label: "Yes",
                  },
                  {
                    value: "no",
                    label: "No",
                  },
                ],
              },
            },

            {
              name: "state-identifies-which-drugs-are-non-pref",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              dependency: {
                conditions: [
                  {
                    name: "g1_cost-shar-for-drugs_state-estab-differ-cost-shar-for-prefer-and-non-prefer",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
              formItemClassName: "ml-[0.6rem] px-4 border-l-4 border-l-primary",
              props: {
                options: [
                  {
                    value: "true",
                    label:
                      "The state identifies which drugs are considered non-preferred.",
                  },
                ],
              },
            },

            {
              name: "assures-timely-process-limit-cost-shar-imposed",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              formItemClassName:
                "ml-[0.6rem] px-4  border-l-4 border-l-primary",
              dependency: {
                conditions: [
                  {
                    name: "g1_cost-shar-for-drugs_state-estab-differ-cost-shar-for-prefer-and-non-prefer",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
              props: {
                options: [
                  {
                    value: "true",
                    label:
                      "The state assures it has a timely process in place to limit cost sharing to the amount imposed for a preferred drug in the case of a non-preferred drug within a therapeutically equivalent or similar class of drugs if the individual's prescribing provider determines that a preferred drug for treatment of the same condition will either be less effective for the individual or will have adverse effects for the individual, or both. In such cases, reimbursement to the pharmacy is based on the appropriate cost-sharing amount.",
                  },
                ],
              },
            },

            {
              name: "all-drugs-consider-preferred-drugs",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              formItemClassName:
                "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
              dependency: {
                conditions: [
                  {
                    name: "g1_cost-shar-for-drugs_state-estab-differ-cost-shar-for-prefer-and-non-prefer",
                    type: "expectedValue",
                    expectedValue: "no",
                  },
                ],
                effect: { type: "show" },
              },
              props: {
                options: [
                  {
                    value: "true",
                    label: "All drugs will be considered preferred drugs.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "Beneficiary and public notice requirements",
      sectionId: "benefi-public-notice-req",
      form: [
        {
          slots: [
            {
              name: "consistent-with-42-cfr-447-57",
              rhf: "Checkbox",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "true",
                    styledLabel: [
                      {
                        text: "Consistent with 42 CFR 447.57, the state makes available a public schedule describing current cost-sharing requirements in a manner that ensures that affected applicants, beneficiaries, and providers are likely to have access to the notice.",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	Prior to submitting a state plan amendment (SPA) that establishes or substantially modifies existing cost-sharing amounts or policies, the state provides the public with advance notice of the SPA, specifying the amount of cost sharing and who is subject to the charges. The state also provides reasonable opportunity for stakeholder comment.",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	Documentation demonstrating that the notice requirements have been met is submitted with the SPA.",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "• 	The state provides an opportunity for additional public notice if cost sharing is substantially modified during the SPA approval process.",
                        type: "default",
                        classname: "block py-1",
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "Additional information",
      sectionId: "addtnl-info",
      form: [
        {
          description: "Other relevant information (optional)",
          slots: [
            {
              name: "description",
              rhf: "Textarea",
              rules: {
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              props: {
                className: "min-h-[114px]",
              },
            },
          ],
        },
      ],
    },
  ],
};
