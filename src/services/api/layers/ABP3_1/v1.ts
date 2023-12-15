import { FormSchema } from "shared-types";

const ABP3_1: FormSchema = {
  header:
    "ABP 3.1: Selection of benchmark benefit package or benchmark-equivalent benefit package",
  sections: [
    {
      title: "Benefit package details",
      form: [
        {
          description: "Select one of the following",
          slots: [
            {
              rhf: "Radio",
              name: "amending_benefit",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state/territory is amending one existing benefit package for the population defined in Section 1.",
                    value: "existing_package",
                  },
                  {
                    label:
                      "The state or territory is creating a single new benefit package for the population defined in Section 1.",
                    value: "new_package",
                  },
                ],
              },
            },
          ],
        },
        {
          description: "Benefit package name",
          slots: [
            {
              rhf: "Input",
              name: "benefit_package_name",
              label: "Benefit package name",
              rules: {
                required: "* Required",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Selection of Section 1937 coverage option",
      form: [
        {
          description:
            "The state/territory selects as its Section 1937 coverage option the following type of benchmark bsenefit package or benchmark-equivalent benefit package under this Alternative Benefit Plan:",
          slots: [
            {
              name: "benchmark",
              rhf: "Radio",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label: "Benchmark benefit package",
                    value: "benefit_package",
                    form: [
                      {
                        description:
                          "The state/territory will provide the following benchmark benefit package:",
                        slots: [
                          {
                            name: "state_territory_benchmark",
                            rhf: "Radio",
                            props: {
                              options: [
                                {
                                  label:
                                    "The standard Blue Cross Blue Shield preferred provider option offered through the Federal Employee Health Benefit Program (FEHBP)",
                                  value: "blue_cross_blue_shield",
                                },
                                {
                                  label:
                                    "State employee coverage that is offered and generally available to state employees (state employee coverage)",
                                  value: "state_employee_coverage",
                                  slots: [
                                    {
                                      rhf: "Input",
                                      name: "plan_name",
                                      label: "Plan name",
                                      rules: {
                                        required: "* Required",
                                      },
                                    },
                                  ],
                                },
                                {
                                  label:
                                    "A commercial HMO with the largest insured commercial, non-Medicaid enrollment in the state/territory (commercial HMO)",
                                  value: "commerical_HMO",
                                  slots: [
                                    {
                                      rhf: "Input",
                                      name: "plan_name",
                                      label: "Plan name",
                                      rules: {
                                        required: "* Required",
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "Secretary-approved coverage",
                                  value: "secretary_approved",
                                  form: [
                                    {
                                      slots: [
                                        {
                                          name: "benefits_based_on",
                                          rhf: "Radio",
                                          rules: {
                                            required: "* Required",
                                          },
                                          props: {
                                            options: [
                                              {
                                                label:
                                                  "The state/territory offers benefits based on the approved state plan.",
                                                value: "state_plan",
                                                form: [
                                                  {
                                                    slots: [
                                                      {
                                                        rhf: "Radio",
                                                        name: "state_plan_benefits",
                                                        props: {
                                                          options: [
                                                            {
                                                              label:
                                                                "The state/territory offers the benefits provided in the approved state plan.",
                                                              value:
                                                                "provided_in_approved_state_plan",
                                                            },
                                                            {
                                                              label:
                                                                "Benefits include all those provided in the approved state plan plus additional benefits.",
                                                              value:
                                                                "additional_benefits",
                                                            },
                                                            {
                                                              label:
                                                                "Benefits are the same as provided in the approved state plan but in a different amount, duration, and/or scope.",
                                                              value:
                                                                "different_amount_duration_scope",
                                                            },
                                                            {
                                                              label:
                                                                "The state/territory offers only a partial list of benefits provided in the approved state plan.",
                                                              value:
                                                                "partial_list",
                                                            },
                                                            {
                                                              label:
                                                                "The state/territory offers a partial list of benefits provided in the approved state plan plus additional benefits.",
                                                              value:
                                                                "partial_list_plus_additional_benefits",
                                                            },
                                                          ],
                                                        },
                                                        rules: {
                                                          required:
                                                            "* Required",
                                                        },
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                              {
                                                label:
                                                  "The state/territory offers an array of benefits from the Section 1937 coverage option and/or base benchmark plan benefit packages, the approved state plan, or a combination of these benefit packages.",
                                                value: "array_of_benefits",
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          rhf: "Textarea",
                                          name: "benefits__description",
                                          label:
                                            "Briefly identify the benefits, the source of benefits, and any limitations.",
                                          rules: {
                                            required: "* Required",
                                          },
                                        },
                                      ],
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
                    label: "Benchmark-equivalent benefit package",
                    value: "equivalent",
                    form: [
                      {
                        description:
                          "The state/territory will provide the following benchmark-equivalent benefit package:",
                        slots: [
                          {
                            rhf: "Radio",
                            name: "geographic_variation",
                            rules: {
                              required: "* Required",
                            },
                            props: {
                              options: [
                                {
                                  label:
                                    "The standard Blue Cross Blue Shield preferred provider option offered through the Federal Employee Health Benefit Program (FEHBP)",
                                  value: "blue_cross_blue_shield",
                                },
                                {
                                  label:
                                    "State employee coverage that is offered and generally available to state employees (state employee coverage)",
                                  value: "state_employee_coverage",
                                  slots: [
                                    {
                                      rhf: "Input",
                                      name: "plan_name",
                                      label: "Plan name",
                                      rules: {
                                        required: "* Required",
                                      },
                                    },
                                  ],
                                },
                                {
                                  label:
                                    "A commercial HMO with the largest insured commercial, non-Medicaid enrollment in the state/territory (commercial HMO)",
                                  value: "commerical_HMO",
                                  slots: [
                                    {
                                      rhf: "Input",
                                      name: "plan_name",
                                      label: "Plan name",
                                      rules: {
                                        required: "* Required",
                                      },
                                    },
                                  ],
                                },
                                {
                                  label:
                                    "The Medicaid state plan coverage provided to Categorically Needy (Mandatory and Options for Coverage) eligibility groups",
                                  value: "state_plan_to_categorically_needy",
                                },
                              ],
                            },
                          },
                        ],
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
      title: "Selection of EHB-benchmark plan",
      form: [
        {
          description:
            "The state or territory must select an EHB-benchmark plan as the basis for providing essential health benefits in its benchmark or benchmark-equivalent package.",
          slots: [
            {
              name: "EHB_benchmark_name",
              rhf: "Input",
              label: "EHB-benchmark plan name",
            },
            {
              name: "additional_information",
              rhf: "Select",
              label:
                "Is the EHB-benchmark plan the same as the Section 1937 coverage option?",
              rules: {
                required: "* Required",
              },
              props: {
                className: "w-[150px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              label:
                "Indicate the EHB-benchmark option as described at 45 CFR 156.111(b)(2)(B) the state or territory will use as its EHB-benchmark plan.",
              name: "EHB_benchmark_option",
              rhf: "Radio",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "State/territory is selecting the EHB-benchmark plan used by the state/territory for the 2017 plan year.",
                    value: "EHB_benchmark_2017_plan_year",
                  },
                  {
                    label:
                      "State/territory is selecting one of the EHB-benchmark plans used for the 2017 plan year by another state/territory.",
                    value: "another_state_EHB_benchmark_plan_year",
                  },
                  {
                    label:
                      "State/territory selects the following EHB-benchmark plan used for the 2017 plan year but will replace coverage of one or more of the categories of EHB with coverage of the same category from the 2017 EHB-benchmark plan of one or more other states.",
                    value: "EHB_benchmark_2017_plan_year_but_replace_coverage",
                    form: [
                      {
                        description: "Indicate the type of EHB-benchmark plan.",
                        slots: [
                          {
                            rhf: "Radio",
                            name: "EHB-benchmark_plan",
                            rules: {
                              required: "* Required",
                            },
                            props: {
                              options: [
                                { label: "", value: "" },
                                { label: "", value: "" },
                                { label: "", value: "" },
                                { label: "", value: "" },
                              ],
                            },
                          },
                          {
                            rhf: "Checkbox",
                            name: "one_or_more_EHBs_other_states",
                            description:
                              "Select one or more EHBs from other states.",
                            props: {
                              options: [
                                {
                                  label: "",
                                  value: "",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "state_territory",
                                      props: {
                                        options: [
                                          { label: "Yes", value: "yes" },
                                          { label: "No", value: "no" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "",
                                  value: "",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "state_territory",
                                      props: {
                                        options: [
                                          { label: "Yes", value: "yes" },
                                          { label: "No", value: "no" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "",
                                  value: "",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "state_territory",
                                      props: {
                                        options: [
                                          { label: "Yes", value: "yes" },
                                          { label: "No", value: "no" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "",
                                  value: "",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "state_territory",
                                      props: {
                                        options: [
                                          { label: "Yes", value: "yes" },
                                          { label: "No", value: "no" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "",
                                  value: "",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "state_territory",
                                      props: {
                                        options: [
                                          { label: "Yes", value: "yes" },
                                          { label: "No", value: "no" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "",
                                  value: "",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "state_territory",
                                      props: {
                                        options: [
                                          { label: "Yes", value: "yes" },
                                          { label: "No", value: "no" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "",
                                  value: "",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "state_territory",
                                      props: {
                                        options: [
                                          { label: "Yes", value: "yes" },
                                          { label: "No", value: "no" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "",
                                  value: "",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "state_territory",
                                      props: {
                                        options: [
                                          { label: "Yes", value: "yes" },
                                          { label: "No", value: "no" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "",
                                  value: "",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "state_territory",
                                      props: {
                                        options: [
                                          { label: "Yes", value: "yes" },
                                          { label: "No", value: "no" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "",
                                  value: "",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "state_territory",
                                      props: {
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
                          },
                        ],
                      },
                    ],
                  },
                  {
                    label:
                      "Select a set of benefits consistent with the 10 EHB categories to become the new EHB-benchmark plan. (Complete and submit the ABP 5: Benefits Description form to describe the set of benefits.)",
                    value: "10_EHB_categories_new_EHB_benchmark",
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "Assurances",
      form: [
        {
          slots: [
            {
              name: "assurances",
              rhf: "Checkbox",
              props: {
                options: [
                  {
                    label:
                      "The state/territory assures the EHB plan meets the scope of benefits standards at 45 CFR 156.111(b), does not exceed generosity of most generous among a set of comparison plans, provides appropriate balance of coverage among 10 EHB categories, and the scope of benefits is equal to or greater than the scope of benefits provided under a typical employer plan as defined at 45 CFR 156.111(b)(2).",
                    value: "meets_scope",
                  },
                  {
                    label:
                      "The state/territory assures that actuarial certification and an associated actuarial report from an actuary, who is a member of the American Academy of Actuaries, in accordance with generally accepted actuarial principles and methodologies, has been completed and is available upon request.",
                    value: "assures_from_acturial_certification",
                  },
                  {
                    label:
                      "The state/territory assures that all services in the EHB-benchmark plan have been accounted for throughout the benefit chart found in ABP 5.",
                    value: "assures_EHB_benchmark_throughout_abp5_benefit",
                  },
                  {
                    label:
                      "The state/territory assures the accuracy of all information in ABP 5 depicting amount, duration, and scope parameters of services authorized in the currently approved Medicaid state plan.",
                    value: "assures_abp5_amount_duration_scope",
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
      form: [
        {
          description:
            "Other information related to selection of the Section 1937 coverage option and the EHB-benchmark plan (optional)",
          slots: [
            {
              name: "additional_information",
              rhf: "Textarea",
            },
          ],
        },
      ],
    },
  ],
};

export const form = ABP3_1;
