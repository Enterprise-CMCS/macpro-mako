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
