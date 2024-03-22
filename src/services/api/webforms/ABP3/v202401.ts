import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header:
    "ABP 3: Selection of benchmark benefit package or benchmark-equivalent benefit package",
  sections: [
    {
      title: "Benefit package details",
      form: [
        {
          description:
            "For the population defined in section 1, the state/territory wants to:",
          slots: [
            {
              rhf: "Radio",
              name: "abp3_benefit-package_details_radiogroup",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label: "Amend one existing benefit package",
                    value: "amend_existing",
                  },
                  {
                    label: "Create a single new benefit package",
                    value: "create_new_benefit_package",
                  },
                ],
              },
            },
            {
              rhf: "Input",
              name: "abp3_benefit-package_name_input",
              label: "Benefit package name",
              labelStyling: "font-bold",
              rules: { required: "* Required" },
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
              name: "abp3_select-of-sect-1937-cov-opt_radiogroup",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label: "Benchmark benefit package",
                    value: "benchmark_benefit_package",
                    form: [
                      {
                        slots: [
                          {
                            rhf: "Radio",
                            name: "abp3_select-of-sect-1937-cov-opt_benchmark-benefit_package_options_radiogroup",
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
                                          name: "abp3_select-of-sect-1937-cov-opt_state-employee-coverage-plan-name_input",
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
                                          name: "abp3_select-of-sect-1937-cov-opt_commercial-hmo_input",
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
                                          name: "abp3_select-of-sect-1937-cov-opt_secretary-approved_radiogroup",
                                          rules: { required: "* Required" },
                                          props: {
                                            options: [
                                              {
                                                label:
                                                  "The state/territory offers the following benefits based on the approved state plan:",
                                                value: "approved_state_plan",
                                                form: [
                                                  {
                                                    slots: [
                                                      {
                                                        rhf: "Radio",
                                                        name: "abp3_select-of-sect-1937-cov-opt_approved-state-plan-opts_radiogroup",
                                                        rules: {
                                                          required:
                                                            "* Required",
                                                        },
                                                        props: {
                                                          options: [
                                                            {
                                                              label:
                                                                "Benefits provided in the approved state plan",
                                                              value:
                                                                "approved_state_plan",
                                                            },
                                                            {
                                                              label:
                                                                "All benefits provided in the approved state plan plus additional benefits",
                                                              value:
                                                                "additional_benefits",
                                                            },
                                                            {
                                                              label:
                                                                "Benefits provided in the approved state plan but in a different amount, duration, and/or scope",
                                                              value:
                                                                "different_amount_duration_scope",
                                                            },
                                                            {
                                                              label:
                                                                "A partial list of benefits provided in the approved state plan",
                                                              value:
                                                                "partial_list_of_benefits",
                                                            },
                                                            {
                                                              label:
                                                                "A partial list of benefits provided in the approved state plan plus additional benefits",
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
                                          name: "abp3_select-of-sect-1937-cov-opt_benefits-and-limits_textarea",
                                          rules: { required: "* Required" },
                                          labelStyling: "font-bold",
                                          label:
                                            "Describe the benefits, source of benefits, and any limitations.",
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
                            name: "abp3_select-of-sect-1937-cov-opt_benchmark-equivalent_radiogroup",
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
                                          name: "abp3_select-of-sect-1937-cov-opt_state-employee-coverage-plan-name_input",
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
                                          name: "abp3_select-of-sect-1937-cov-opt_commercial-hmo-plan-name_input",
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
              name: "abp3_select-of-base-bench-plan_same-as-sect-1937_select",
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
                "The state/territory will use the following as its base benchmark plan as described at 45 CFR 156.100(a):",
              labelStyling: "font-bold",
              name: "abp3_select-of-base-bench-plan_base-benchmark-plan_radiogroup",
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
              name: "abp3_select-of-base-bench-plan_name_input",
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
            "Other information about selection of the Section 1937 coverage option and the base benchmark plan (optional)",
          slots: [
            {
              rhf: "Textarea",
              name: "abp3_additional_information_textarea",
            },
          ],
        },
      ],
    },
  ],
};
