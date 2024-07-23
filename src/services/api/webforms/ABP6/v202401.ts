import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header: "ABP 6: Benchmark-equivalent benefit package",
  formId: "abp6",
  sections: [
    {
      title: "Description of benefits",
      sectionId: "desc-of-ben",
      form: [
        {
          slots: [
            {
              rhf: "TextDisplay",
              name: "helperText",
              text: "Complete this section only if the state/territory is proposing a benchmark-equivalent benefit package.",
            },
            {
              rhf: "Input",
              name: "agg-actuarial-ben-plan",
              label:
                "Aggregate actuarial value of the benchmark plan (e.g., FEHBP, state/territory employee coverage, commercial plan, state plan) that is equivalent to the state/territory's benefit package",
              labelClassName: "font-bold",
              props: {
                icon: "$",
              },
              rules: {
                required: "* Required",
                pattern: {
                  value: /^[0-9]\d*$/,
                  message: "Must be a positive integer value",
                },
              },
            },
            {
              rhf: "Input",
              name: "agg-actuarial-ben-euqivalent-plan",
              label:
                "Aggregate actuarial value of the state/territory's benchmark-equivalent plan (must be greater than or equal to the amount entered above)",
              labelClassName: "font-bold",
              props: {
                icon: "$",
              },
              rules: {
                required: "* Required",
                pattern: {
                  value: /^[0-9]\d*$/,
                  message: "Must be a positive integer value",
                },
                validate: {
                  greaterThanValueAbove: (v, vals) =>
                    parseInt(v) > parseInt(vals?.["agg-actuarial-ben-plan"]) ||
                    "Must be greater than value entered above",
                },
              },
            },
            {
              rhf: "Checkbox",
              name: "state-desc-plan_included_files",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "benefit_chart",
                    label:
                      "The state/territory has included a chart and a thorough description of all benefits included in its benchmark-equivalent benefit package with a crosswalk of each benefit to the essential health benefit (EHB) categories or an indication that the benefit is not an essential health benefit. The state/territory has also included the payment methodology associated with each benefit.",
                    slots: [
                      {
                        rhf: "Upload",
                        name: "benefit-chart-of-benchmark-equiv",
                        rules: { required: "* Required" },
                        label: "Upload attachment(s)",
                        labelClassName: "font-bold",
                      },
                    ],
                  },
                  {
                    value: "acturaial_report",
                    label:
                      "The state/territory has included a copy of the actuarial report.",
                    slots: [
                      {
                        name: "actuarial-report",
                        label: "Upload actuarial report",
                        labelClassName: "font-bold",
                        rhf: "Upload",
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "Textarea",
              labelClassName: "font-bold",
              name: "other-info-related-bench-equiv",
              label:
                "Other information related to this benchmark-equivalent benefit package (optional)",
            },
          ],
        },
      ],
    },
    {
      title: "Benchmark-equivalent benefit package assurances",
      sectionId: "bench-equiv-assurances",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "assurance-options",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "aggregate_quiv_value_preparation",
                    label:
                      "The state/territory assures that the benefit package has an aggregate actuarial value equivalent to the benchmark plan in the actuarial report prepared:",
                    slots: [
                      {
                        rhf: "Checkbox",
                        name: "actuarial-report-preparation-assurances",
                        rules: { required: "* Required" },
                        props: {
                          options: [
                            {
                              value: "individual_member_AAA",
                              label:
                                "By an individual who is a member of the American Academy of Actuaries",
                            },
                            {
                              value: "gen_accepted_actuarial_principles",
                              label:
                                "Using generally accepted actuarial principles and methodologies",
                            },
                            {
                              value: "standard_utilization_price_factors",
                              label:
                                "Using a standardized set of utilization and price factors",
                            },
                            {
                              value: "using_standard_representative_pop",
                              label:
                                "Using a standardized population that is representative of the population being served",
                            },
                            {
                              value:
                                "same_factors_wo_considering_coveragediffs_deliverymethod_controlcost",
                              label:
                                "Applying the same principles and factors in comparing the value of different coverage (or benefits) without taking into account any differences in coverage based on the method of delivery or means of cost control or utilization used",
                            },
                            {
                              value:
                                "recognizing_state_reduction_benefits_with_increase_ben_values_wo_regard_deliverymethod_ccostcontrol_utilization",
                              label:
                                "Recognizing the ability of a state/territory to reduce benefits by taking into account an increase in actuarial value of benefits coverage regardless of any differences in coverage based on the method of delivery or means of cost control or utilization used",
                            },
                            {
                              value:
                                "recognizing_state)reduction_benefits_with_increase_ben_values_resulting-from_costsharing_limits",
                              label:
                                "Taking into account the ability of the state/territory to reduce benefits by considering the increase in actuarial value of health benefits coverage offered under the state/territory plan that results from the limitations on cost sharing (with the exception of premiums) under that coverage",
                            },
                          ],
                        },
                      },
                    ],
                  },
                  {
                    value:
                      "equivalent_covers_inpatient_outpatient_lab_xray_prescriptions_childcare_immunizations_emergency_mentalhealth_familyplanning",
                    label:
                      "The state/territory assures, as required by Section 1937(b)(2)(A) and 42 CFR 440.335, that benchmark-equivalent coverage shall include coverage for the following categories of services: inpatient and outpatient hospital services, physicians' surgical and medical services, laboratory and x-ray services, prescription drugs, well-baby and well-child care, including age-appropriate immunizations, emergency services, mental health benefits, family planning services and supplies, and other appropriate preventive services as designated by the Secretary.",
                  },
                  {
                    value:
                      "inlcuded_desc_of_ben_and_val_as_percentage_of_equivalent",
                    label:
                      "The state/territory has included a description of the benefits included and the actuarial value of the category as a percentage of the actuarial value of the coverage for the benefits included in the benchmark-equivalent benefit plan.",
                  },
                ],
              },
            },
            {
              rhf: "Select",
              name: "bench-pckg-include-vision-services",
              rules: { required: "* Required" },
              labelClassName: "font-bold",
              label:
                "Does the benchmark benefit package that is the basis for comparison of the benchmark-equivalent benefit package include vision services?",
              props: {
                className: "w-[150px]",
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
              rhf: "Checkbox",
              name: "vision-service-equivalent-percentage",
              rules: { required: "* Required" },
              formItemClassName: "ml-[0.7rem] border-l-4 border-l-primary",
              dependency: {
                conditions: [
                  {
                    name: "abp6_bench-equiv-assurances_bench-pckg-include-vision-services",
                    expectedValue: "yes",
                    type: "expectedValue",
                  },
                ],
                effect: { type: "show" },
              },
              props: {
                options: [
                  {
                    value: "actuarial_equiv_val_coverage_min_75_percent",
                    label:
                      "The actuarial value of the coverage for vision services in the benchmark-equivalent package is at least 75% of the actuarial value of the coverage for vision services in the benchmark benefit package used for comparison by the state/territory.",
                  },
                ],
              },
            },
            {
              rhf: "Select",
              name: "bench-pckg-include-hearing-services",
              rules: { required: "* Required" },
              labelClassName: "font-bold",
              label:
                "Does the benchmark benefit package that is the basis for comparison of the benchmark-equivalent benefit package include hearing services?",
              props: {
                className: "w-[150px]",
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
              rhf: "Checkbox",
              name: "hearing-service-equivalent-percentage",
              rules: { required: "* Required" },
              formItemClassName: "ml-[0.7rem] border-l-4 border-l-primary",
              dependency: {
                conditions: [
                  {
                    name: "abp6_bench-equiv-assurances_bench-pckg-include-hearing-services",
                    expectedValue: "yes",
                    type: "expectedValue",
                  },
                ],
                effect: { type: "show" },
              },
              props: {
                options: [
                  {
                    value: "actuarial_equiv_val_coverage_min_75_percent",
                    label:
                      "The actuarial value of the coverage for hearing services in the benchmark-equivalent package is at least 75% of the actuarial value of the coverage for hearing services in the benchmark benefit package used for comparison by the state/territory.",
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
          description:
            "Other information about benchmark-equivalent assurances (optional)",
          slots: [
            {
              name: "description",
              rhf: "Textarea",
              props: {
                className: "h-[114px]",
              },
            },
          ],
        },
      ],
    },
  ],
};
