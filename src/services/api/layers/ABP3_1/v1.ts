import { FormSchema } from "shared-types";

const ABP3_1: FormSchema = {
  header:
    "ABP 3.1: Selection of benchmark benefit package or benchmark-equivalent benefit package",
  sections: [
    {
      title: "Benefit package details",
      form: [
        {
          description: "Select the following",
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
                                      name: "benchmark_plan_name",
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
                                      name: "benchmark_HMO_plan_name",
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
                                          labelStyling: "font-bold",
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
                                      name: "benchmark_equivalent_state_coverage_plan_name",
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
                                      name: "benchmark_equivalent_HMO_plan_name",
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
              labelStyling: "font-bold",
              rules: {
                required: "* Required",
              },
            },
            {
              name: "is_EHB_benchmark_plan_same_section_1937",
              rhf: "Select",
              label:
                "Is the EHB-benchmark plan the same as the Section 1937 coverage option?",
              labelStyling: "font-bold",
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
              labelStyling: "font-bold",
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
                    slots: [
                      {
                        rhf: "Select",
                        name: "is_geographic_area",
                        label: "Identify the state/territory",
                        labelStyling: "p-3",
                        formItemStyling: "flex-row",
                        props: {
                          className: "w-[150px]",
                          options: [
                            { label: "Alabama", value: "AL" },
                            { label: "Alaska", value: "AK" },
                            {
                              label: "American Samoa",
                              value: "AS",
                            },
                            { label: "Arizona", value: "AZ" },
                            { label: "Arkansas", value: "AR" },
                            { label: "California", value: "CA" },
                            { label: "Colorado", value: "CO" },
                            { label: "Connecticut", value: "CT" },
                            { label: "Delaware", value: "DE" },
                            {
                              label: "District of Columbia",
                              value: "DC",
                            },
                            { label: "Florida", value: "FL" },
                            { label: "Georgia", value: "GA" },
                            { label: "Guam", value: "GU" },
                            { label: "Hawaii", value: "HI" },
                            { label: "Idaho", value: "ID" },
                            { label: "Illinois", value: "IL" },
                            { label: "Indiana", value: "IN" },
                            { label: "Iowa", value: "IA" },
                            { label: "Kansas", value: "KS" },
                            { label: "Kentucky", value: "KY" },
                            { label: "Louisiana", value: "LA" },
                            { label: "Maine", value: "ME" },
                            { label: "Maryland", value: "MD" },
                            {
                              label: "Massachusetts",
                              value: "MA",
                            },
                            { label: "Michigan", value: "MI" },
                            { label: "Minnesota", value: "MN" },
                            { label: "Mississippi", value: "MS" },
                            { label: "Missouri", value: "MO" },
                            { label: "Montana", value: "MT" },
                            { label: "Nebraska", value: "NE" },
                            { label: "Nevada", value: "NV" },
                            {
                              label: "New Hampshire",
                              value: "NH",
                            },
                            { label: "New Jersey", value: "NJ" },
                            { label: "New Mexico", value: "NM" },
                            { label: "New York", value: "NY" },
                            {
                              label: "North Carolina",
                              value: "NC",
                            },
                            {
                              label: "North Dakota",
                              value: "ND",
                            },
                            {
                              label: "Northern Mariana Islands",
                              value: "MP",
                            },
                            { label: "Ohio", value: "OH" },
                            { label: "Oklahoma", value: "OK" },
                            { label: "Oregon", value: "OR" },
                            {
                              label: "Pennsylvania",
                              value: "PA",
                            },
                            { label: "Puerto Rico", value: "PR" },
                            {
                              label: "Rhode Island",
                              value: "RI",
                            },
                            {
                              label: "South Carolina",
                              value: "SC",
                            },
                            {
                              label: "South Dakota",
                              value: "SD",
                            },
                            { label: "Tennessee", value: "TN" },
                            { label: "Texas", value: "TX" },
                            { label: "Utah", value: "UT" },
                            { label: "Vermont", value: "VT" },
                            {
                              label: "Virgin Islands",
                              value: "VI",
                            },
                            { label: "Virginia", value: "VA" },
                            { label: "Washington", value: "WA" },
                            {
                              label: "West Virginia",
                              value: "WV",
                            },
                            { label: "Wisconsin", value: "WI" },
                            { label: "Wyoming", value: "WY" },
                          ],
                        },
                        rules: {
                          required: "* Required",
                        },
                      },
                      {
                        rhf: "Radio",
                        name: "indicate_EHB_bencmark_plan",
                        label: "Indicate the type of EHB-benchmark plan.",
                        labelStyling: "font-bold",
                        props: {
                          options: [
                            {
                              label:
                                "The largest plan by enrollment of the three largest small group insurance products in the state's small group market",
                              value: "three_largest_small_group_insurance",
                            },
                            {
                              label:
                                "Any of the largest three state employee health benefit plans by enrollment",
                              value: "largest_three_state_employee_plans",
                            },
                            {
                              label:
                                "Any of the largest three national FEHBP plan options open to Federal employees in all geographies by enrollment",
                              value: "largest_three_state_FEHBP_plans",
                            },
                            {
                              label:
                                "The largest insured commercial non-Medicaid HMO",
                              value: "larged_insured_commercial",
                            },
                          ],
                        },
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
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
                                {
                                  label:
                                    "The largest plan by enrollment of the three largest small group insurance products in the state's small group market",
                                  value: "three_largest_small_group_insurance",
                                },
                                {
                                  label:
                                    "Any of the largest three state employee health benefit plans by enrollment",
                                  value: "largest_three_state_employee_plans",
                                },
                                {
                                  label:
                                    "Any of the largest three national FEHBP plan options open to Federal employees in all geographies by enrollment",
                                  value: "largest_three_state_FEHBP_plans",
                                },
                                {
                                  label:
                                    "The largest insured commercial non-Medicaid HMO",
                                  value: "larged_insured_commercial",
                                },
                              ],
                            },
                          },
                          {
                            rhf: "Checkbox",
                            name: "one_or_more_EHBs_other_states",
                            label: "Select one or more EHBs from other states.",
                            labelStyling: "font-bold",
                            props: {
                              options: [
                                {
                                  label: "Ambulatory patient services",
                                  value: "ambulatory_patient_services",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "ambulatory_patient_services_state_territory",
                                      label: "Identify the state/territory",
                                      labelStyling: "p-3",
                                      formItemStyling: "flex-row",
                                      props: {
                                        className: "w-[150px]",
                                        options: [
                                          { label: "Alabama", value: "AL" },
                                          { label: "Alaska", value: "AK" },
                                          {
                                            label: "American Samoa",
                                            value: "AS",
                                          },
                                          { label: "Arizona", value: "AZ" },
                                          { label: "Arkansas", value: "AR" },
                                          { label: "California", value: "CA" },
                                          { label: "Colorado", value: "CO" },
                                          { label: "Connecticut", value: "CT" },
                                          { label: "Delaware", value: "DE" },
                                          {
                                            label: "District of Columbia",
                                            value: "DC",
                                          },
                                          { label: "Florida", value: "FL" },
                                          { label: "Georgia", value: "GA" },
                                          { label: "Guam", value: "GU" },
                                          { label: "Hawaii", value: "HI" },
                                          { label: "Idaho", value: "ID" },
                                          { label: "Illinois", value: "IL" },
                                          { label: "Indiana", value: "IN" },
                                          { label: "Iowa", value: "IA" },
                                          { label: "Kansas", value: "KS" },
                                          { label: "Kentucky", value: "KY" },
                                          { label: "Louisiana", value: "LA" },
                                          { label: "Maine", value: "ME" },
                                          { label: "Maryland", value: "MD" },
                                          {
                                            label: "Massachusetts",
                                            value: "MA",
                                          },
                                          { label: "Michigan", value: "MI" },
                                          { label: "Minnesota", value: "MN" },
                                          { label: "Mississippi", value: "MS" },
                                          { label: "Missouri", value: "MO" },
                                          { label: "Montana", value: "MT" },
                                          { label: "Nebraska", value: "NE" },
                                          { label: "Nevada", value: "NV" },
                                          {
                                            label: "New Hampshire",
                                            value: "NH",
                                          },
                                          { label: "New Jersey", value: "NJ" },
                                          { label: "New Mexico", value: "NM" },
                                          { label: "New York", value: "NY" },
                                          {
                                            label: "North Carolina",
                                            value: "NC",
                                          },
                                          {
                                            label: "North Dakota",
                                            value: "ND",
                                          },
                                          {
                                            label: "Northern Mariana Islands",
                                            value: "MP",
                                          },
                                          { label: "Ohio", value: "OH" },
                                          { label: "Oklahoma", value: "OK" },
                                          { label: "Oregon", value: "OR" },
                                          {
                                            label: "Pennsylvania",
                                            value: "PA",
                                          },
                                          { label: "Puerto Rico", value: "PR" },
                                          {
                                            label: "Rhode Island",
                                            value: "RI",
                                          },
                                          {
                                            label: "South Carolina",
                                            value: "SC",
                                          },
                                          {
                                            label: "South Dakota",
                                            value: "SD",
                                          },
                                          { label: "Tennessee", value: "TN" },
                                          { label: "Texas", value: "TX" },
                                          { label: "Utah", value: "UT" },
                                          { label: "Vermont", value: "VT" },
                                          {
                                            label: "Virgin Islands",
                                            value: "VI",
                                          },
                                          { label: "Virginia", value: "VA" },
                                          { label: "Washington", value: "WA" },
                                          {
                                            label: "West Virginia",
                                            value: "WV",
                                          },
                                          { label: "Wisconsin", value: "WI" },
                                          { label: "Wyoming", value: "WY" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "Emergency services",
                                  value: "emergency_services",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "emergency_services_state_territory",
                                      label: "Identify the state/territory",
                                      labelStyling: "p-3",
                                      formItemStyling: "flex-row",
                                      rules: {
                                        required: "* Required",
                                      },
                                      props: {
                                        className: "w-[150px]",
                                        options: [
                                          { label: "Alabama", value: "AL" },
                                          { label: "Alaska", value: "AK" },
                                          {
                                            label: "American Samoa",
                                            value: "AS",
                                          },
                                          { label: "Arizona", value: "AZ" },
                                          { label: "Arkansas", value: "AR" },
                                          { label: "California", value: "CA" },
                                          { label: "Colorado", value: "CO" },
                                          { label: "Connecticut", value: "CT" },
                                          { label: "Delaware", value: "DE" },
                                          {
                                            label: "District of Columbia",
                                            value: "DC",
                                          },
                                          { label: "Florida", value: "FL" },
                                          { label: "Georgia", value: "GA" },
                                          { label: "Guam", value: "GU" },
                                          { label: "Hawaii", value: "HI" },
                                          { label: "Idaho", value: "ID" },
                                          { label: "Illinois", value: "IL" },
                                          { label: "Indiana", value: "IN" },
                                          { label: "Iowa", value: "IA" },
                                          { label: "Kansas", value: "KS" },
                                          { label: "Kentucky", value: "KY" },
                                          { label: "Louisiana", value: "LA" },
                                          { label: "Maine", value: "ME" },
                                          { label: "Maryland", value: "MD" },
                                          {
                                            label: "Massachusetts",
                                            value: "MA",
                                          },
                                          { label: "Michigan", value: "MI" },
                                          { label: "Minnesota", value: "MN" },
                                          { label: "Mississippi", value: "MS" },
                                          { label: "Missouri", value: "MO" },
                                          { label: "Montana", value: "MT" },
                                          { label: "Nebraska", value: "NE" },
                                          { label: "Nevada", value: "NV" },
                                          {
                                            label: "New Hampshire",
                                            value: "NH",
                                          },
                                          { label: "New Jersey", value: "NJ" },
                                          { label: "New Mexico", value: "NM" },
                                          { label: "New York", value: "NY" },
                                          {
                                            label: "North Carolina",
                                            value: "NC",
                                          },
                                          {
                                            label: "North Dakota",
                                            value: "ND",
                                          },
                                          {
                                            label: "Northern Mariana Islands",
                                            value: "MP",
                                          },
                                          { label: "Ohio", value: "OH" },
                                          { label: "Oklahoma", value: "OK" },
                                          { label: "Oregon", value: "OR" },
                                          {
                                            label: "Pennsylvania",
                                            value: "PA",
                                          },
                                          { label: "Puerto Rico", value: "PR" },
                                          {
                                            label: "Rhode Island",
                                            value: "RI",
                                          },
                                          {
                                            label: "South Carolina",
                                            value: "SC",
                                          },
                                          {
                                            label: "South Dakota",
                                            value: "SD",
                                          },
                                          { label: "Tennessee", value: "TN" },
                                          { label: "Texas", value: "TX" },
                                          { label: "Utah", value: "UT" },
                                          { label: "Vermont", value: "VT" },
                                          {
                                            label: "Virgin Islands",
                                            value: "VI",
                                          },
                                          { label: "Virginia", value: "VA" },
                                          { label: "Washington", value: "WA" },
                                          {
                                            label: "West Virginia",
                                            value: "WV",
                                          },
                                          { label: "Wisconsin", value: "WI" },
                                          { label: "Wyoming", value: "WY" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "Hospitalization",
                                  value: "hospitalization",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "hospitalization_state_territory",
                                      label: "Identify the state/territory",
                                      labelStyling: "p-3",
                                      formItemStyling: "flex-row",
                                      rules: {
                                        required: "* Required",
                                      },
                                      props: {
                                        className: "w-[150px]",
                                        options: [
                                          { label: "Alabama", value: "AL" },
                                          { label: "Alaska", value: "AK" },
                                          {
                                            label: "American Samoa",
                                            value: "AS",
                                          },
                                          { label: "Arizona", value: "AZ" },
                                          { label: "Arkansas", value: "AR" },
                                          { label: "California", value: "CA" },
                                          { label: "Colorado", value: "CO" },
                                          { label: "Connecticut", value: "CT" },
                                          { label: "Delaware", value: "DE" },
                                          {
                                            label: "District of Columbia",
                                            value: "DC",
                                          },
                                          { label: "Florida", value: "FL" },
                                          { label: "Georgia", value: "GA" },
                                          { label: "Guam", value: "GU" },
                                          { label: "Hawaii", value: "HI" },
                                          { label: "Idaho", value: "ID" },
                                          { label: "Illinois", value: "IL" },
                                          { label: "Indiana", value: "IN" },
                                          { label: "Iowa", value: "IA" },
                                          { label: "Kansas", value: "KS" },
                                          { label: "Kentucky", value: "KY" },
                                          { label: "Louisiana", value: "LA" },
                                          { label: "Maine", value: "ME" },
                                          { label: "Maryland", value: "MD" },
                                          {
                                            label: "Massachusetts",
                                            value: "MA",
                                          },
                                          { label: "Michigan", value: "MI" },
                                          { label: "Minnesota", value: "MN" },
                                          { label: "Mississippi", value: "MS" },
                                          { label: "Missouri", value: "MO" },
                                          { label: "Montana", value: "MT" },
                                          { label: "Nebraska", value: "NE" },
                                          { label: "Nevada", value: "NV" },
                                          {
                                            label: "New Hampshire",
                                            value: "NH",
                                          },
                                          { label: "New Jersey", value: "NJ" },
                                          { label: "New Mexico", value: "NM" },
                                          { label: "New York", value: "NY" },
                                          {
                                            label: "North Carolina",
                                            value: "NC",
                                          },
                                          {
                                            label: "North Dakota",
                                            value: "ND",
                                          },
                                          {
                                            label: "Northern Mariana Islands",
                                            value: "MP",
                                          },
                                          { label: "Ohio", value: "OH" },
                                          { label: "Oklahoma", value: "OK" },
                                          { label: "Oregon", value: "OR" },
                                          {
                                            label: "Pennsylvania",
                                            value: "PA",
                                          },
                                          { label: "Puerto Rico", value: "PR" },
                                          {
                                            label: "Rhode Island",
                                            value: "RI",
                                          },
                                          {
                                            label: "South Carolina",
                                            value: "SC",
                                          },
                                          {
                                            label: "South Dakota",
                                            value: "SD",
                                          },
                                          { label: "Tennessee", value: "TN" },
                                          { label: "Texas", value: "TX" },
                                          { label: "Utah", value: "UT" },
                                          { label: "Vermont", value: "VT" },
                                          {
                                            label: "Virgin Islands",
                                            value: "VI",
                                          },
                                          { label: "Virginia", value: "VA" },
                                          { label: "Washington", value: "WA" },
                                          {
                                            label: "West Virginia",
                                            value: "WV",
                                          },
                                          { label: "Wisconsin", value: "WI" },
                                          { label: "Wyoming", value: "WY" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "Maternity and newborn care",
                                  value: "maternity_and_newborn_care",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "maternity_and_newborn_care_state_territory",
                                      label: "Identify the state/territory",
                                      labelStyling: "p-3",
                                      formItemStyling: "flex-row",
                                      rules: {
                                        required: "* Required",
                                      },
                                      props: {
                                        className: "w-[150px]",
                                        options: [
                                          { label: "Alabama", value: "AL" },
                                          { label: "Alaska", value: "AK" },
                                          {
                                            label: "American Samoa",
                                            value: "AS",
                                          },
                                          { label: "Arizona", value: "AZ" },
                                          { label: "Arkansas", value: "AR" },
                                          { label: "California", value: "CA" },
                                          { label: "Colorado", value: "CO" },
                                          { label: "Connecticut", value: "CT" },
                                          { label: "Delaware", value: "DE" },
                                          {
                                            label: "District of Columbia",
                                            value: "DC",
                                          },
                                          { label: "Florida", value: "FL" },
                                          { label: "Georgia", value: "GA" },
                                          { label: "Guam", value: "GU" },
                                          { label: "Hawaii", value: "HI" },
                                          { label: "Idaho", value: "ID" },
                                          { label: "Illinois", value: "IL" },
                                          { label: "Indiana", value: "IN" },
                                          { label: "Iowa", value: "IA" },
                                          { label: "Kansas", value: "KS" },
                                          { label: "Kentucky", value: "KY" },
                                          { label: "Louisiana", value: "LA" },
                                          { label: "Maine", value: "ME" },
                                          { label: "Maryland", value: "MD" },
                                          {
                                            label: "Massachusetts",
                                            value: "MA",
                                          },
                                          { label: "Michigan", value: "MI" },
                                          { label: "Minnesota", value: "MN" },
                                          { label: "Mississippi", value: "MS" },
                                          { label: "Missouri", value: "MO" },
                                          { label: "Montana", value: "MT" },
                                          { label: "Nebraska", value: "NE" },
                                          { label: "Nevada", value: "NV" },
                                          {
                                            label: "New Hampshire",
                                            value: "NH",
                                          },
                                          { label: "New Jersey", value: "NJ" },
                                          { label: "New Mexico", value: "NM" },
                                          { label: "New York", value: "NY" },
                                          {
                                            label: "North Carolina",
                                            value: "NC",
                                          },
                                          {
                                            label: "North Dakota",
                                            value: "ND",
                                          },
                                          {
                                            label: "Northern Mariana Islands",
                                            value: "MP",
                                          },
                                          { label: "Ohio", value: "OH" },
                                          { label: "Oklahoma", value: "OK" },
                                          { label: "Oregon", value: "OR" },
                                          {
                                            label: "Pennsylvania",
                                            value: "PA",
                                          },
                                          { label: "Puerto Rico", value: "PR" },
                                          {
                                            label: "Rhode Island",
                                            value: "RI",
                                          },
                                          {
                                            label: "South Carolina",
                                            value: "SC",
                                          },
                                          {
                                            label: "South Dakota",
                                            value: "SD",
                                          },
                                          { label: "Tennessee", value: "TN" },
                                          { label: "Texas", value: "TX" },
                                          { label: "Utah", value: "UT" },
                                          { label: "Vermont", value: "VT" },
                                          {
                                            label: "Virgin Islands",
                                            value: "VI",
                                          },
                                          { label: "Virginia", value: "VA" },
                                          { label: "Washington", value: "WA" },
                                          {
                                            label: "West Virginia",
                                            value: "WV",
                                          },
                                          { label: "Wisconsin", value: "WI" },
                                          { label: "Wyoming", value: "WY" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label:
                                    "Mental health and substance use disorders",
                                  value:
                                    "mental_health_and_substance_use_disorders",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "mental_health_and_substance_use_disorders_state_territory",
                                      label: "Identify the state/territory",
                                      labelStyling: "p-3",
                                      formItemStyling: "flex-row",
                                      rules: {
                                        required: "* Required",
                                      },
                                      props: {
                                        className: "w-[150px]",
                                        options: [
                                          { label: "Alabama", value: "AL" },
                                          { label: "Alaska", value: "AK" },
                                          {
                                            label: "American Samoa",
                                            value: "AS",
                                          },
                                          { label: "Arizona", value: "AZ" },
                                          { label: "Arkansas", value: "AR" },
                                          { label: "California", value: "CA" },
                                          { label: "Colorado", value: "CO" },
                                          { label: "Connecticut", value: "CT" },
                                          { label: "Delaware", value: "DE" },
                                          {
                                            label: "District of Columbia",
                                            value: "DC",
                                          },
                                          { label: "Florida", value: "FL" },
                                          { label: "Georgia", value: "GA" },
                                          { label: "Guam", value: "GU" },
                                          { label: "Hawaii", value: "HI" },
                                          { label: "Idaho", value: "ID" },
                                          { label: "Illinois", value: "IL" },
                                          { label: "Indiana", value: "IN" },
                                          { label: "Iowa", value: "IA" },
                                          { label: "Kansas", value: "KS" },
                                          { label: "Kentucky", value: "KY" },
                                          { label: "Louisiana", value: "LA" },
                                          { label: "Maine", value: "ME" },
                                          { label: "Maryland", value: "MD" },
                                          {
                                            label: "Massachusetts",
                                            value: "MA",
                                          },
                                          { label: "Michigan", value: "MI" },
                                          { label: "Minnesota", value: "MN" },
                                          { label: "Mississippi", value: "MS" },
                                          { label: "Missouri", value: "MO" },
                                          { label: "Montana", value: "MT" },
                                          { label: "Nebraska", value: "NE" },
                                          { label: "Nevada", value: "NV" },
                                          {
                                            label: "New Hampshire",
                                            value: "NH",
                                          },
                                          { label: "New Jersey", value: "NJ" },
                                          { label: "New Mexico", value: "NM" },
                                          { label: "New York", value: "NY" },
                                          {
                                            label: "North Carolina",
                                            value: "NC",
                                          },
                                          {
                                            label: "North Dakota",
                                            value: "ND",
                                          },
                                          {
                                            label: "Northern Mariana Islands",
                                            value: "MP",
                                          },
                                          { label: "Ohio", value: "OH" },
                                          { label: "Oklahoma", value: "OK" },
                                          { label: "Oregon", value: "OR" },
                                          {
                                            label: "Pennsylvania",
                                            value: "PA",
                                          },
                                          { label: "Puerto Rico", value: "PR" },
                                          {
                                            label: "Rhode Island",
                                            value: "RI",
                                          },
                                          {
                                            label: "South Carolina",
                                            value: "SC",
                                          },
                                          {
                                            label: "South Dakota",
                                            value: "SD",
                                          },
                                          { label: "Tennessee", value: "TN" },
                                          { label: "Texas", value: "TX" },
                                          { label: "Utah", value: "UT" },
                                          { label: "Vermont", value: "VT" },
                                          {
                                            label: "Virgin Islands",
                                            value: "VI",
                                          },
                                          { label: "Virginia", value: "VA" },
                                          { label: "Washington", value: "WA" },
                                          {
                                            label: "West Virginia",
                                            value: "WV",
                                          },
                                          { label: "Wisconsin", value: "WI" },
                                          { label: "Wyoming", value: "WY" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "Prescription drugs",
                                  value: "prescription_drugs",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "prescription_drugs_state_territory",
                                      label: "Identify the state/territory",
                                      labelStyling: "p-3",
                                      formItemStyling: "flex-row",
                                      rules: {
                                        required: "* Required",
                                      },
                                      props: {
                                        className: "w-[150px]",
                                        options: [
                                          { label: "Alabama", value: "AL" },
                                          { label: "Alaska", value: "AK" },
                                          {
                                            label: "American Samoa",
                                            value: "AS",
                                          },
                                          { label: "Arizona", value: "AZ" },
                                          { label: "Arkansas", value: "AR" },
                                          { label: "California", value: "CA" },
                                          { label: "Colorado", value: "CO" },
                                          { label: "Connecticut", value: "CT" },
                                          { label: "Delaware", value: "DE" },
                                          {
                                            label: "District of Columbia",
                                            value: "DC",
                                          },
                                          { label: "Florida", value: "FL" },
                                          { label: "Georgia", value: "GA" },
                                          { label: "Guam", value: "GU" },
                                          { label: "Hawaii", value: "HI" },
                                          { label: "Idaho", value: "ID" },
                                          { label: "Illinois", value: "IL" },
                                          { label: "Indiana", value: "IN" },
                                          { label: "Iowa", value: "IA" },
                                          { label: "Kansas", value: "KS" },
                                          { label: "Kentucky", value: "KY" },
                                          { label: "Louisiana", value: "LA" },
                                          { label: "Maine", value: "ME" },
                                          { label: "Maryland", value: "MD" },
                                          {
                                            label: "Massachusetts",
                                            value: "MA",
                                          },
                                          { label: "Michigan", value: "MI" },
                                          { label: "Minnesota", value: "MN" },
                                          { label: "Mississippi", value: "MS" },
                                          { label: "Missouri", value: "MO" },
                                          { label: "Montana", value: "MT" },
                                          { label: "Nebraska", value: "NE" },
                                          { label: "Nevada", value: "NV" },
                                          {
                                            label: "New Hampshire",
                                            value: "NH",
                                          },
                                          { label: "New Jersey", value: "NJ" },
                                          { label: "New Mexico", value: "NM" },
                                          { label: "New York", value: "NY" },
                                          {
                                            label: "North Carolina",
                                            value: "NC",
                                          },
                                          {
                                            label: "North Dakota",
                                            value: "ND",
                                          },
                                          {
                                            label: "Northern Mariana Islands",
                                            value: "MP",
                                          },
                                          { label: "Ohio", value: "OH" },
                                          { label: "Oklahoma", value: "OK" },
                                          { label: "Oregon", value: "OR" },
                                          {
                                            label: "Pennsylvania",
                                            value: "PA",
                                          },
                                          { label: "Puerto Rico", value: "PR" },
                                          {
                                            label: "Rhode Island",
                                            value: "RI",
                                          },
                                          {
                                            label: "South Carolina",
                                            value: "SC",
                                          },
                                          {
                                            label: "South Dakota",
                                            value: "SD",
                                          },
                                          { label: "Tennessee", value: "TN" },
                                          { label: "Texas", value: "TX" },
                                          { label: "Utah", value: "UT" },
                                          { label: "Vermont", value: "VT" },
                                          {
                                            label: "Virgin Islands",
                                            value: "VI",
                                          },
                                          { label: "Virginia", value: "VA" },
                                          { label: "Washington", value: "WA" },
                                          {
                                            label: "West Virginia",
                                            value: "WV",
                                          },
                                          { label: "Wisconsin", value: "WI" },
                                          { label: "Wyoming", value: "WY" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label:
                                    "Rehabilitative and habilitative services and devices",
                                  value:
                                    "rehabilitative_and_habilitative_services_and_devices",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "rehabilitative_and_habilitative_services_and_devices_state_territory",
                                      label: "Identify the state/territory",
                                      labelStyling: "p-3",
                                      formItemStyling: "flex-row",
                                      rules: {
                                        required: "* Required",
                                      },
                                      props: {
                                        className: "w-[150px]",
                                        options: [
                                          { label: "Alabama", value: "AL" },
                                          { label: "Alaska", value: "AK" },
                                          {
                                            label: "American Samoa",
                                            value: "AS",
                                          },
                                          { label: "Arizona", value: "AZ" },
                                          { label: "Arkansas", value: "AR" },
                                          { label: "California", value: "CA" },
                                          { label: "Colorado", value: "CO" },
                                          { label: "Connecticut", value: "CT" },
                                          { label: "Delaware", value: "DE" },
                                          {
                                            label: "District of Columbia",
                                            value: "DC",
                                          },
                                          { label: "Florida", value: "FL" },
                                          { label: "Georgia", value: "GA" },
                                          { label: "Guam", value: "GU" },
                                          { label: "Hawaii", value: "HI" },
                                          { label: "Idaho", value: "ID" },
                                          { label: "Illinois", value: "IL" },
                                          { label: "Indiana", value: "IN" },
                                          { label: "Iowa", value: "IA" },
                                          { label: "Kansas", value: "KS" },
                                          { label: "Kentucky", value: "KY" },
                                          { label: "Louisiana", value: "LA" },
                                          { label: "Maine", value: "ME" },
                                          { label: "Maryland", value: "MD" },
                                          {
                                            label: "Massachusetts",
                                            value: "MA",
                                          },
                                          { label: "Michigan", value: "MI" },
                                          { label: "Minnesota", value: "MN" },
                                          { label: "Mississippi", value: "MS" },
                                          { label: "Missouri", value: "MO" },
                                          { label: "Montana", value: "MT" },
                                          { label: "Nebraska", value: "NE" },
                                          { label: "Nevada", value: "NV" },
                                          {
                                            label: "New Hampshire",
                                            value: "NH",
                                          },
                                          { label: "New Jersey", value: "NJ" },
                                          { label: "New Mexico", value: "NM" },
                                          { label: "New York", value: "NY" },
                                          {
                                            label: "North Carolina",
                                            value: "NC",
                                          },
                                          {
                                            label: "North Dakota",
                                            value: "ND",
                                          },
                                          {
                                            label: "Northern Mariana Islands",
                                            value: "MP",
                                          },
                                          { label: "Ohio", value: "OH" },
                                          { label: "Oklahoma", value: "OK" },
                                          { label: "Oregon", value: "OR" },
                                          {
                                            label: "Pennsylvania",
                                            value: "PA",
                                          },
                                          { label: "Puerto Rico", value: "PR" },
                                          {
                                            label: "Rhode Island",
                                            value: "RI",
                                          },
                                          {
                                            label: "South Carolina",
                                            value: "SC",
                                          },
                                          {
                                            label: "South Dakota",
                                            value: "SD",
                                          },
                                          { label: "Tennessee", value: "TN" },
                                          { label: "Texas", value: "TX" },
                                          { label: "Utah", value: "UT" },
                                          { label: "Vermont", value: "VT" },
                                          {
                                            label: "Virgin Islands",
                                            value: "VI",
                                          },
                                          { label: "Virginia", value: "VA" },
                                          { label: "Washington", value: "WA" },
                                          {
                                            label: "West Virginia",
                                            value: "WV",
                                          },
                                          { label: "Wisconsin", value: "WI" },
                                          { label: "Wyoming", value: "WY" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label: "Laboratory services",
                                  value: "laboratory_services",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "laboratory_services_state_territory",
                                      label: "Identify the state/territory",
                                      labelStyling: "p-3",
                                      formItemStyling: "flex-row",
                                      rules: {
                                        required: "* Required",
                                      },
                                      props: {
                                        className: "w-[150px]",
                                        options: [
                                          { label: "Alabama", value: "AL" },
                                          { label: "Alaska", value: "AK" },
                                          {
                                            label: "American Samoa",
                                            value: "AS",
                                          },
                                          { label: "Arizona", value: "AZ" },
                                          { label: "Arkansas", value: "AR" },
                                          { label: "California", value: "CA" },
                                          { label: "Colorado", value: "CO" },
                                          { label: "Connecticut", value: "CT" },
                                          { label: "Delaware", value: "DE" },
                                          {
                                            label: "District of Columbia",
                                            value: "DC",
                                          },
                                          { label: "Florida", value: "FL" },
                                          { label: "Georgia", value: "GA" },
                                          { label: "Guam", value: "GU" },
                                          { label: "Hawaii", value: "HI" },
                                          { label: "Idaho", value: "ID" },
                                          { label: "Illinois", value: "IL" },
                                          { label: "Indiana", value: "IN" },
                                          { label: "Iowa", value: "IA" },
                                          { label: "Kansas", value: "KS" },
                                          { label: "Kentucky", value: "KY" },
                                          { label: "Louisiana", value: "LA" },
                                          { label: "Maine", value: "ME" },
                                          { label: "Maryland", value: "MD" },
                                          {
                                            label: "Massachusetts",
                                            value: "MA",
                                          },
                                          { label: "Michigan", value: "MI" },
                                          { label: "Minnesota", value: "MN" },
                                          { label: "Mississippi", value: "MS" },
                                          { label: "Missouri", value: "MO" },
                                          { label: "Montana", value: "MT" },
                                          { label: "Nebraska", value: "NE" },
                                          { label: "Nevada", value: "NV" },
                                          {
                                            label: "New Hampshire",
                                            value: "NH",
                                          },
                                          { label: "New Jersey", value: "NJ" },
                                          { label: "New Mexico", value: "NM" },
                                          { label: "New York", value: "NY" },
                                          {
                                            label: "North Carolina",
                                            value: "NC",
                                          },
                                          {
                                            label: "North Dakota",
                                            value: "ND",
                                          },
                                          {
                                            label: "Northern Mariana Islands",
                                            value: "MP",
                                          },
                                          { label: "Ohio", value: "OH" },
                                          { label: "Oklahoma", value: "OK" },
                                          { label: "Oregon", value: "OR" },
                                          {
                                            label: "Pennsylvania",
                                            value: "PA",
                                          },
                                          { label: "Puerto Rico", value: "PR" },
                                          {
                                            label: "Rhode Island",
                                            value: "RI",
                                          },
                                          {
                                            label: "South Carolina",
                                            value: "SC",
                                          },
                                          {
                                            label: "South Dakota",
                                            value: "SD",
                                          },
                                          { label: "Tennessee", value: "TN" },
                                          { label: "Texas", value: "TX" },
                                          { label: "Utah", value: "UT" },
                                          { label: "Vermont", value: "VT" },
                                          {
                                            label: "Virgin Islands",
                                            value: "VI",
                                          },
                                          { label: "Virginia", value: "VA" },
                                          { label: "Washington", value: "WA" },
                                          {
                                            label: "West Virginia",
                                            value: "WV",
                                          },
                                          { label: "Wisconsin", value: "WI" },
                                          { label: "Wyoming", value: "WY" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label:
                                    "Preventive and wellness services and chronic disease management",
                                  value:
                                    "preventive_and_wellness_services_and_chronic_disease_management",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "preventive_and_wellness_services_and_chronic_disease_management_state_territory",
                                      label: "Identify the state/territory",
                                      labelStyling: "p-3",
                                      formItemStyling: "flex-row",
                                      rules: {
                                        required: "* Required",
                                      },
                                      props: {
                                        className: "w-[150px]",
                                        options: [
                                          { label: "Alabama", value: "AL" },
                                          { label: "Alaska", value: "AK" },
                                          {
                                            label: "American Samoa",
                                            value: "AS",
                                          },
                                          { label: "Arizona", value: "AZ" },
                                          { label: "Arkansas", value: "AR" },
                                          { label: "California", value: "CA" },
                                          { label: "Colorado", value: "CO" },
                                          { label: "Connecticut", value: "CT" },
                                          { label: "Delaware", value: "DE" },
                                          {
                                            label: "District of Columbia",
                                            value: "DC",
                                          },
                                          { label: "Florida", value: "FL" },
                                          { label: "Georgia", value: "GA" },
                                          { label: "Guam", value: "GU" },
                                          { label: "Hawaii", value: "HI" },
                                          { label: "Idaho", value: "ID" },
                                          { label: "Illinois", value: "IL" },
                                          { label: "Indiana", value: "IN" },
                                          { label: "Iowa", value: "IA" },
                                          { label: "Kansas", value: "KS" },
                                          { label: "Kentucky", value: "KY" },
                                          { label: "Louisiana", value: "LA" },
                                          { label: "Maine", value: "ME" },
                                          { label: "Maryland", value: "MD" },
                                          {
                                            label: "Massachusetts",
                                            value: "MA",
                                          },
                                          { label: "Michigan", value: "MI" },
                                          { label: "Minnesota", value: "MN" },
                                          { label: "Mississippi", value: "MS" },
                                          { label: "Missouri", value: "MO" },
                                          { label: "Montana", value: "MT" },
                                          { label: "Nebraska", value: "NE" },
                                          { label: "Nevada", value: "NV" },
                                          {
                                            label: "New Hampshire",
                                            value: "NH",
                                          },
                                          { label: "New Jersey", value: "NJ" },
                                          { label: "New Mexico", value: "NM" },
                                          { label: "New York", value: "NY" },
                                          {
                                            label: "North Carolina",
                                            value: "NC",
                                          },
                                          {
                                            label: "North Dakota",
                                            value: "ND",
                                          },
                                          {
                                            label: "Northern Mariana Islands",
                                            value: "MP",
                                          },
                                          { label: "Ohio", value: "OH" },
                                          { label: "Oklahoma", value: "OK" },
                                          { label: "Oregon", value: "OR" },
                                          {
                                            label: "Pennsylvania",
                                            value: "PA",
                                          },
                                          { label: "Puerto Rico", value: "PR" },
                                          {
                                            label: "Rhode Island",
                                            value: "RI",
                                          },
                                          {
                                            label: "South Carolina",
                                            value: "SC",
                                          },
                                          {
                                            label: "South Dakota",
                                            value: "SD",
                                          },
                                          { label: "Tennessee", value: "TN" },
                                          { label: "Texas", value: "TX" },
                                          { label: "Utah", value: "UT" },
                                          { label: "Vermont", value: "VT" },
                                          {
                                            label: "Virgin Islands",
                                            value: "VI",
                                          },
                                          { label: "Virginia", value: "VA" },
                                          { label: "Washington", value: "WA" },
                                          {
                                            label: "West Virginia",
                                            value: "WV",
                                          },
                                          { label: "Wisconsin", value: "WI" },
                                          { label: "Wyoming", value: "WY" },
                                        ],
                                      },
                                    },
                                  ],
                                },
                                {
                                  label:
                                    "Pediatric services, including oral and vision care",
                                  value:
                                    "pediatric_services_including_oral_and_vision_care",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "ediatric_services_including_oral_and_vision_care_state_territory",
                                      label: "Identify the state/territory",
                                      labelStyling: "p-3",
                                      formItemStyling: "flex-row",
                                      rules: {
                                        required: "* Required",
                                      },
                                      props: {
                                        className: "w-[150px]",
                                        options: [
                                          { label: "Alabama", value: "AL" },
                                          { label: "Alaska", value: "AK" },
                                          {
                                            label: "American Samoa",
                                            value: "AS",
                                          },
                                          { label: "Arizona", value: "AZ" },
                                          { label: "Arkansas", value: "AR" },
                                          { label: "California", value: "CA" },
                                          { label: "Colorado", value: "CO" },
                                          { label: "Connecticut", value: "CT" },
                                          { label: "Delaware", value: "DE" },
                                          {
                                            label: "District of Columbia",
                                            value: "DC",
                                          },
                                          { label: "Florida", value: "FL" },
                                          { label: "Georgia", value: "GA" },
                                          { label: "Guam", value: "GU" },
                                          { label: "Hawaii", value: "HI" },
                                          { label: "Idaho", value: "ID" },
                                          { label: "Illinois", value: "IL" },
                                          { label: "Indiana", value: "IN" },
                                          { label: "Iowa", value: "IA" },
                                          { label: "Kansas", value: "KS" },
                                          { label: "Kentucky", value: "KY" },
                                          { label: "Louisiana", value: "LA" },
                                          { label: "Maine", value: "ME" },
                                          { label: "Maryland", value: "MD" },
                                          {
                                            label: "Massachusetts",
                                            value: "MA",
                                          },
                                          { label: "Michigan", value: "MI" },
                                          { label: "Minnesota", value: "MN" },
                                          { label: "Mississippi", value: "MS" },
                                          { label: "Missouri", value: "MO" },
                                          { label: "Montana", value: "MT" },
                                          { label: "Nebraska", value: "NE" },
                                          { label: "Nevada", value: "NV" },
                                          {
                                            label: "New Hampshire",
                                            value: "NH",
                                          },
                                          { label: "New Jersey", value: "NJ" },
                                          { label: "New Mexico", value: "NM" },
                                          { label: "New York", value: "NY" },
                                          {
                                            label: "North Carolina",
                                            value: "NC",
                                          },
                                          {
                                            label: "North Dakota",
                                            value: "ND",
                                          },
                                          {
                                            label: "Northern Mariana Islands",
                                            value: "MP",
                                          },
                                          { label: "Ohio", value: "OH" },
                                          { label: "Oklahoma", value: "OK" },
                                          { label: "Oregon", value: "OR" },
                                          {
                                            label: "Pennsylvania",
                                            value: "PA",
                                          },
                                          { label: "Puerto Rico", value: "PR" },
                                          {
                                            label: "Rhode Island",
                                            value: "RI",
                                          },
                                          {
                                            label: "South Carolina",
                                            value: "SC",
                                          },
                                          {
                                            label: "South Dakota",
                                            value: "SD",
                                          },
                                          { label: "Tennessee", value: "TN" },
                                          { label: "Texas", value: "TX" },
                                          { label: "Utah", value: "UT" },
                                          { label: "Vermont", value: "VT" },
                                          {
                                            label: "Virgin Islands",
                                            value: "VI",
                                          },
                                          { label: "Virginia", value: "VA" },
                                          { label: "Washington", value: "WA" },
                                          {
                                            label: "West Virginia",
                                            value: "WV",
                                          },
                                          { label: "Wisconsin", value: "WI" },
                                          { label: "Wyoming", value: "WY" },
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
              name: "assurances_meets_scope",
              rhf: "Checkbox",
              props: {
                options: [
                  {
                    label:
                      "The state/territory assures the EHB plan meets the scope of benefits standards at 45 CFR 156.111(b), does not exceed generosity of most generous among a set of comparison plans, provides appropriate balance of coverage among 10 EHB categories, and the scope of benefits is equal to or greater than the scope of benefits provided under a typical employer plan as defined at 45 CFR 156.111(b)(2).",
                    value: "meets_scope",
                  },
                ],
              },
            },

            {
              name: "assurances_acturial",
              rhf: "Checkbox",
              dependency: {
                conditions: [
                  {
                    name: "EHB_benchmark_option",
                    type: "expectedValue",
                    expectedValue: "EHB_benchmark_2017_plan_year",
                  },
                ],
                effect: { type: "hide" },
              },
              props: {
                options: [
                  {
                    label:
                      "The state/territory assures that actuarial certification and an associated actuarial report from an actuary, who is a member of the American Academy of Actuaries, in accordance with generally accepted actuarial principles and methodologies, has been completed and is available upon request.",
                    value: "assures_from_acturial_certification",
                  },
                ],
              },
            },

            {
              name: "assurances_EHB",
              rhf: "Checkbox",
              props: {
                options: [
                  {
                    label:
                      "The state/territory assures that all services in the EHB-benchmark plan have been accounted for throughout the benefit chart found in ABP 5.",
                    value: "assures_EHB_benchmark_throughout_abp5_benefit",
                  },
                ],
              },
            },

            {
              name: "assurances_abp5",
              rhf: "Checkbox",
              props: {
                options: [
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
