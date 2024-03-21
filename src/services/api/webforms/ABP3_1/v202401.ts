import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header:
    "ABP 3.1 Selection of benchmark benefit package or benchmark-equivalent benefit package",
  sections: [
    {
      title: "Benefit package details",
      form: [
        {
          description:
            "For the population defined in Section 1, the state/territory wants to:",
          slots: [
            {
              rhf: "Radio",
              name: "abp3-1_benefit-package-details_amending-benefit_radio",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label: "Amend one existing benefit package",
                    value: "existing_package",
                  },
                  {
                    label: "Create a single new benefit package",
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
              name: "abp3-1_benefit-package-details_name_input",
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
            "The state/territory selects as its Section 1937 coverage option the following type of benchmark benefit package or benchmark-equivalent benefit package under this Alternative Benefit Plan:",
          slots: [
            {
              name: "abp3-1_select-of-sect-1937-coverage-opt_benchmark_radio",
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
                        slots: [
                          {
                            name: "abp3-1_select-of-sect-1937-coverage-opt_state-territory-bench_radio",
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
                                      name: "abp3-1_select-of-sect-1937-coverage-opt_state-territory-bench-plan-name_input",
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
                                      name: "abp3-1_select-of-sect-1937-coverage-opt_bench-HMO-plan-name_input",
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
                                          name: "abp3-1_select-of-sect-1937-coverage-opt_benefits-based-on_radio",
                                          rhf: "Radio",
                                          rules: {
                                            required: "* Required",
                                          },
                                          props: {
                                            options: [
                                              {
                                                label:
                                                  "The state/territory offers the following benefits based on the approved state plan:",
                                                value: "state_plan",
                                                form: [
                                                  {
                                                    slots: [
                                                      {
                                                        rhf: "Radio",
                                                        name: "abp3-1_select-of-sect-1937-coverage-opt_state-plan-benefits_radio",
                                                        props: {
                                                          options: [
                                                            {
                                                              label:
                                                                "Benefits provided in the approved state plan",
                                                              value:
                                                                "provided_in_approved_state_plan",
                                                            },
                                                            {
                                                              label:
                                                                "Benefits provided in the approved state plan plus additional benefits",
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
                                                                "partial_list",
                                                            },
                                                            {
                                                              label:
                                                                "A partial list of benefits provided in the approved state plan plus additional benefits",
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
                                          name: "abp3-1_select-of-sect-1937-coverage-opt_benefits-description_textarea",
                                          label:
                                            "Describe the benefits, source of benefits, and any limitations.",
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
                            name: "abp3-1_select-of-sect-1937-coverage-opt_geographic-variation_radio",
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
                                      name: "abp3-1_select-of-sect-1937-coverage-opt_bench-equivalent-state-coverage-plan-name_input",
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
                                      name: "abp3-1_select-of-sect-1937-coverage-opt_bench-equivalent-HMO-plan-name_input",
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
              name: "abp3-1_select-of-EHB-bench-plan_name_input",
              rhf: "Input",
              label: "EHB-benchmark plan name",
              labelStyling: "font-bold",
              rules: {
                required: "* Required",
              },
            },

            {
              name: "abp3-1_select-of-EHB-bench-plan_is-EHB-bench-plan-same-section-1937_select",
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
                "The state/territory will use the following as its EHB-benchmark option as described at 45 CFR 156.111(b)(2)(B), in compliance with the individual insurance market under 45 CFR 156.100 through 156.125:",
              labelStyling: "font-bold",
              name: "abp3-1_select-of-EHB-bench-plan_option_radio",
              rhf: "Radio",
              descriptionAbove: true,
              descriptionStyling: "text-base text-black",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The EHB-benchmark plan used by the state/territory for the 2017 plan year",
                    value: "EHB_benchmark_2017_plan_year",
                  },
                  {
                    label:
                      "One of the EHB-benchmark plans used for the 2017 plan year by another state/territory",
                    value: "another_state_EHB_benchmark_plan_year",
                    slots: [
                      {
                        rhf: "Select",
                        name: "abp3-1_select-of-EHB-bench-plan_is-geo-area_select",
                        label: "State/territory",
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
                        name: "abp3-1_select-of-EHB-bench-plan_indicate-EHB-bench-plan_radio",
                        label: "Type of EHB-benchmark plan",
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
                                "Any of the largest three national Federal Employee Health Benefit Program (FEHBP) plan options open to federal employees in all geographies by enrollment",
                              value: "largest_three_state_FEHBP_plans",
                            },
                            {
                              label:
                                "The largest insured commercial, non-Medicaid HMO",
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
                      "The following EHB-benchmark plan used for the 2017 plan year but replacing coverage of one or more EHB categories with coverage of the same category from the 2017 EHB-benchmark plan of one or more other states",
                    value: "EHB_benchmark_2017_plan_year_but_replace_coverage",
                    form: [
                      {
                        description: "Type of EHB-benchmark plan",
                        slots: [
                          {
                            rhf: "Radio",
                            name: "abp3-1_select-of-EHB-bench-plan_EHB-bench-plan_radio",
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
                                    "Any of the largest three national Federal Employee Health Benefit Program (FEHBP) plan options open to federal employees in all geographies by enrollment",
                                  value: "largest_three_state_FEHBP_plans",
                                },
                                {
                                  label:
                                    "The largest insured commercial, non-Medicaid HMO",
                                  value: "larged_insured_commercial",
                                },
                              ],
                            },
                          },
                          {
                            rhf: "Checkbox",
                            name: "abp3-1_select-of-EHB-bench-plan_one-or-more-EHBs-other-states_check",
                            label: "Select one or more EHBs from other states.",
                            labelStyling: "font-bold",
                            rules: { required: "* Required" },
                            props: {
                              options: [
                                {
                                  label: "Ambulatory patient services",
                                  value: "ambulatory_patient_services",
                                  slots: [
                                    {
                                      rhf: "Select",
                                      name: "abp3-1_select-of-EHB-bench-plan_ambulatory-patient-services-state-territory_select",
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
                                      name: "abp3-1_select-of-EHB-bench-plan_emergency-services-state-territory_select",
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
                                      name: "abp3-1_select-of-EHB-bench-plan_hospital-state-territory_select",
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
                                      name: "abp3-1_select-of-EHB-bench-plan_maternity-and-newborn-care-state-territory_select",
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
                                      name: "abp3-1_select-of-EHB-bench-plan_mental-health-and-substance-use-disorders-state-territory_select",
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
                                      name: "abp3-1_select-of-EHB-bench-plan_prescription-drugs-state-territory_select",
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
                                      name: "abp3-1_select-of-EHB-bench-plan_rehab-and-habilitative-services-and-devices-state-territory_select",
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
                                      name: "abp3-1_select-of-EHB-bench-plan_laboratory-services-state-territory_select",
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
                                      name: "abp3-1_select-of-EHB-bench-plan_prevent-and-well-services_and_chronic_disease_management_state_territory_select",
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
                                      name: "abp3-1_select-of-EHB-bench-plan_pediatric-services-including-oral-and-vision-care-state-territory_select",
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
                      "A set of benefits consistent with the 10 EHB categories to become the new EHB-benchmark plan (Submit ABP 5: Benefits description)",
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
              name: "abp3-1_assurances_meets-scope_check",
              rhf: "Checkbox",
              rules: {
                required: "* Required",
              },
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
                    dependency: {
                      conditions: [
                        {
                          name: "abp3-1_select-of-EHB-bench-plan_option_radio",
                          type: "expectedValue",
                          expectedValue: "EHB_benchmark_2017_plan_year",
                        },
                      ],
                      effect: { type: "hide" },
                    },
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
            "Other information about selection of the Section 1937 coverage option and the EHB-benchmark plan (optional)",
          slots: [
            {
              name: "abp3-1_additional_information_textarea",
              rhf: "Textarea",
            },
          ],
        },
      ],
    },
  ],
};
