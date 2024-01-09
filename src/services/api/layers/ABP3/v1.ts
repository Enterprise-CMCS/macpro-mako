import { FormSchema } from "shared-types";

const ABP3: FormSchema = {
  header:
    "ABP 3: Selection of benchmark benefit package or benchmark-equivalent benefit package",
  sections: [
    {
      title: "Benefit package details",
      form: [
        {
          description: "Select one of the following",
          slots: [
            {
              rhf: "Radio",
              name: "benefit_package_details",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label:
                      "The state/territory is amending one existing benefit package for the population defined in section 1.",
                    value: "benchmark_amending",
                  },
                  {
                    label:
                      "The state/territory is creating a single new benefit package for the population defined in section 1.",
                    value: "benchmark_creating",
                  },
                ],
              },
            },
            {
              rhf: "Input",
              name: "benefit_package_name",
              label: "Benefit package name",
              rules: { required: "* Required" },
              dependency: {
                conditions: [
                  {
                    name: "benefit_package_details",
                    type: "expectedValue",
                    expectedValue: "benchmark_creating",
                  },
                ],
                effect: { type: "show" },
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
            "The state/territory selects as its Section 1937 coverage option the following type of benchmark benefit package or benchmark-equivalent benefit package under this Alternative Benefit Plan:",
          slots: [
            {
              rhf: "Radio",
              name: "section_1937_coverage_option",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label: "Benchmark benefit package",
                    value: "benchmark_benefit_package",
                    form: [
                      {
                        description:
                          "The state/territory will provide the following benchmark benefit package:",
                        slots: [
                          {
                            rhf: "Radio",
                            name: "Benchmark_benefit_packag_options",
                            rules: { required: "* Required" },
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
                                  form: [
                                    {
                                      slots: [
                                        {
                                          rhf: "Input",
                                          label: "Plan name",
                                          name: "state_employee_coverage_plan_name",
                                          rules: { required: "* Required" },
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  label:
                                    "A commercial HMO with the largest insured commercial, non-Medicaid enrollment in the state/territory (commercial HMO)",
                                  value: "commercial_hmo",
                                  form: [
                                    {
                                      slots: [
                                        {
                                          rhf: "Input",
                                          label: "Plan name",
                                          name: "commercial_hmo_plan_name",
                                          rules: { required: "* Required" },
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  label: "Secretary-approved coverage",
                                  value: "secretary_approved_coverage",
                                  form: [
                                    {
                                      slots: [
                                        {
                                          rhf: "Radio",
                                          name: "secretary_approved_coverage_options",
                                          rules: { required: "* Required" },
                                          props: {
                                            options: [
                                              {
                                                label:
                                                  "The state/territory offers benefits based on the approved state plan.",
                                                value: "approved_state_plan",
                                                form: [
                                                  {
                                                    slots: [
                                                      {
                                                        rhf: "Radio",
                                                        name: "approved_state_plan_options",
                                                        rules: {
                                                          required:
                                                            "* Required",
                                                        },
                                                        props: {
                                                          options: [
                                                            {
                                                              label:
                                                                "The state/territory offers the benefits provided in the approved state plan.",
                                                              value:
                                                                "approved_state_plan",
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
                                                                "partial_list_of_benefits",
                                                            },
                                                            {
                                                              label:
                                                                "The state/territory offers a partial list of benefits provided in the approved state plan plus additional benefits.",
                                                              value:
                                                                "partial_list_of_benefits_plus_additional_benefits",
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
                                                  "The state/territory offers an array of benefits from the Section 1937 coverage option and/or base benchmark plan benefit packages, the approved state plan, or a combination of these benefit packages.",
                                                value: "array_of_benefits",
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          rhf: "Textarea",
                                          name: "benefits_and_limitations",
                                          rules: { required: "* Required" },
                                          label:
                                            "Briefly identify the benefits, the source of benefits, and any limitations.",
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
                    value: "benchmark_equivalent_benefit_package",
                    form: [
                      {
                        description:
                          "The state/territory will provide the following benchmark-equivalent benefit package:",
                        slots: [
                          {
                            rhf: "Radio",
                            name: "benchmark_equivalent",
                            rules: { required: "* Required" },
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
                                  form: [
                                    {
                                      slots: [
                                        {
                                          rhf: "Input",
                                          name: "state_employee_coverage_plan_name",
                                          label: "Plan name",
                                          rules: { required: "* Required" },
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  label:
                                    "A commercial HMO with the largest insured commercial, non-Medicaid enrollment in the state/territory (commercial HMO)",
                                  value: "commercial_hmo",
                                  form: [
                                    {
                                      slots: [
                                        {
                                          rhf: "Input",
                                          name: "commercial_hmo_plan_name",
                                          label: "Plan name",
                                          rules: { required: "* Required" },
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  label: "Secretary-approved coverage",
                                  value: "secretary_approved_coverage",
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
      title: "Selection of base benchmark plan",
      form: [
        {
          description:
            "The state/territory must select a base benchmark plan as the basis for providing essential health benefits in its benchmark or benchmark-equivalent package.",
          slots: [
            {
              rhf: "Select",
              label:
                "Is the base benchmark plan the same as the Section 1937 coverage option?",
              name: "base_benchmark_plan_same_as_section_1937",
              rules: { required: "* Required" },
              props: {
                className: "w-[150px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              rhf: "Radio",
              label:
                "Indicate which benchmark plan described at 45 CFR 156.100(a) the state/territory will use as its base benchmark plan.",
              name: "base_benchmark_plan",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label:
                      "The largest plan by enrollment of the three largest small group insurance products in the state's small group market",
                    value: "largest_plan_by_enrollment",
                  },
                  {
                    label:
                      "Any of the largest three state employee health benefit plans by enrollment",
                    value: "any_of_largest_three_state",
                  },
                  {
                    label:
                      "Any of the largest three national FEHBP plan options open to federal employees in all geographies by enrollment",
                    value: "any_of_largest_three_national_fehbp_plan_options",
                  },
                  {
                    label: "The largest insured commercial non-Medicaid HMO",
                    value: "largest_insured_commercial_hmo",
                  },
                ],
              },
            },
            {
              rhf: "Input",
              label: "Plan name",
              name: "base_benchmark_plan_name",
              rules: { required: "* Required" },
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
            "Other information related to selection of the Section 1937 coverage option and the base benchmark plan (optional)",
          slots: [
            {
              rhf: "Textarea",
              name: "additional_information",
            },
          ],
        },
      ],
    },
  ],
};

export const form = ABP3;
