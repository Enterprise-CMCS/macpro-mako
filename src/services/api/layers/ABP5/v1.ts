import { FormSchema, RHFSlotProps, Section } from "shared-types";

const benefitSourceOptions = [
  {
    label: "Base Benchmark Small Group",
    value: "base_benchmark_small_group",
  },
  {
    label: "Base Benchmark Federal Employees",
    value: "base_benchmark_federal_employees",
  },
  {
    label: "Base Benchmark State Employees",
    value: "base_benchmark_state_employees",
  },
  {
    label: "Base Benchmark Commercial HMO",
    value: "base_benchmark_commercial_hmo",
  },
  { label: "1937 Federal BC/BS", value: "1937_federal_bc_bs" },
  {
    label: "1937 State Employees",
    value: "1937_state_employees",
  },
  {
    label: "1937 Commercial HMO",
    value: "1937_commercial_hmo",
  },
  { label: "State Plan 1905(a)", value: "state_plan_1905_a" },
  { label: "State Plan 1915(i)", value: "state_plan_1915_i" },
  { label: "State Plan 1915(j)", value: "state_plan_1915_j" },
  { label: "State Plan 1915(k)", value: "state_plan_1915_k" },
  { label: "State Plan 1945", value: "state_plan_1945" },
  { label: "State Plan Other", value: "state_plan_other" },
  { label: "Secretary-Approved Other", value: "secretary_approved_other" },
];

const providerQualificationsOptions = [
  { label: "Medicaid State Plan", value: "medicaid_state_plan" },
  {
    label: "Selected Public Employee/Commercial Plan",
    value: "selected_public_employee_commercial_plan",
  },
  {
    label: "State Plan & Public Employee/Commercial Plan",
    value: "state_plan_public_employee_commercial_plan",
  },
  { label: "Other", value: "other" },
];

interface SubsectionData {
  title: string;
  namePrefix: string;
  description?: string;
  headerSlots?: RHFSlotProps[];
}

function subsection({
  title,
  namePrefix,
  description,
  headerSlots = [],
}: SubsectionData): Section {
  return {
    title: title,
    subsection: true,
    form: [
      {
        description: description,
        descriptionStyling: "font-normal",
        slots: [
          {
            rhf: "FieldGroup",
            name: `${namePrefix}_benefit`,
            groupNamePrefix: `${namePrefix}_benefit`,
            props: {
              appendText: "Add benefit",
              removeText: "Remove benefit",
            },
            fields: [
              ...headerSlots,
              {
                rhf: "Input",
                label: "Benefit provided",
                labelStyling: "font-bold",
                name: `${namePrefix}_benefit_provided`,
                rules: { required: "* Required" },
                props: {
                  className: "w-[300px]",
                },
              },
              {
                rhf: "Select",
                label: "Source",
                labelStyling: "font-bold",
                name: `${namePrefix}_source`,
                rules: { required: "* Required" },
                props: {
                  className: "w-[300px]",
                  options: benefitSourceOptions,
                },
              },
              {
                rhf: "Input",
                label:
                  "Other information regarding this benefit source, including the name of the source plan",
                labelStyling: "font-bold",
                name: `${namePrefix}_state_plan_other_information`,
                formItemStyling: "ml-[0.6rem] px-4 border-l-4 border-l-primary",
                rules: { required: "* Required" },
                dependency: {
                  conditions: [
                    {
                      name: `${namePrefix}_source`,
                      type: "expectedValue",
                      expectedValue: "state_plan_other",
                    },
                  ],
                  effect: { type: "show" },
                },
              },
              {
                rhf: "Input",
                label:
                  "Other information regarding this benefit source, including the name of the source plan",
                labelStyling: "font-bold",
                name: `${namePrefix}_secretary_approved_other_information`,
                formItemStyling: "ml-[0.6rem] px-4 border-l-4 border-l-primary",
                rules: { required: "* Required" },
                dependency: {
                  conditions: [
                    {
                      name: `${namePrefix}_source`,
                      type: "expectedValue",
                      expectedValue: "secretary_approved_other",
                    },
                  ],
                  effect: { type: "show" },
                },
              },
              {
                rhf: "Input",
                label: "Authorization",
                labelStyling: "font-bold",
                name: `${namePrefix}_authorization`,
                rules: { required: "* Required" },
                props: {
                  className: "w-[300px]",
                },
              },
              {
                rhf: "Select",
                label: "Provider qualifications",
                labelStyling: "font-bold",
                name: `${namePrefix}_provider_qualifications`,
                rules: { required: "* Required" },
                props: {
                  className: "w-[300px]",
                  options: providerQualificationsOptions,
                },
              },
              {
                rhf: "Input",
                label: "Other information regarding provider qualifications",
                labelStyling: "font-bold",
                name: `${namePrefix}_provider_qualifications_other_information`,
                formItemStyling: "ml-[0.6rem] px-4 border-l-4 border-l-primary",
                rules: { required: "* Required" },
                dependency: {
                  conditions: [
                    {
                      name: `${namePrefix}_provider_qualifications`,
                      type: "expectedValue",
                      expectedValue: "other",
                    },
                  ],
                  effect: { type: "show" },
                },
              },
              {
                rhf: "Input",
                label: "Amount limit",
                labelStyling: "font-bold",
                name: `${namePrefix}_amount_limit`,
                rules: { required: "* Required" },
                props: {
                  className: "w-[300px]",
                },
              },
              {
                rhf: "Input",
                label: "Duration limit",
                labelStyling: "font-bold",
                name: `${namePrefix}_duration_limit`,
                rules: { required: "* Required" },
                props: {
                  className: "w-[300px]",
                },
              },
              {
                rhf: "Input",
                label: "Scope limit",
                labelStyling: "font-bold",
                name: `${namePrefix}_scope_limit`,
                rules: { required: "* Required" },
                props: {
                  className: "w-[300px]",
                },
              },
              {
                rhf: "Radio",
                label:
                  "Is there an EHB benchmark benefit duplicated or substituted?",
                labelStyling: "font-bold",
                name: `${namePrefix}_benchmark_benefit_duplicated_or_substituted`,
                rules: { required: "* Required" },
                props: {
                  options: [
                    {
                      label: "Yes, a duplication",
                      value: "yes_duplication",
                      form: [
                        {
                          slots: [
                            {
                              rhf: "Input",
                              label: "Benefit duplicated",
                              labelStyling: "font-bold",
                              name: "benefit_duplicated",
                              rules: { required: "* Required" },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      label: "Yes, a substitution",
                      value: "yes_substitution",
                      form: [
                        {
                          slots: [
                            {
                              rhf: "Input",
                              label: "Benefit substituted",
                              labelStyling: "font-bold",
                              name: "benefit_substituted",
                              rules: { required: "* Required" },
                            },
                          ],
                        },
                      ],
                    },
                    { label: "No", value: "no" },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

const ABP5: FormSchema = {
  header: "ABP 5: Benefits description",
  sections: [
    {
      title: "State plan alignment",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label:
                "Does this description of benefits align with the traditional state plan?",
              labelStyling: "font-bold",
              name: "benefits_align_with_traditional_state_plan",
              rules: { required: "* Required" },
              props: {
                className: "w-[150px]",
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
      title: "Description of benefits",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label:
                "Does the state/territory propose a benchmark-equivalent benefit package?",
              labelStyling: "font-bold",
              name: "benchmark_equivalent_benefit_package",
              rules: { required: "* Required" },
              props: {
                className: "w-[150px]",
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
      title: "Benefits included in Alternative Benefit Plan",
      form: [
        {
          slots: [
            {
              rhf: "Input",
              label:
                "Enter the specific name of the base benchmark plan selected.",
              labelStyling: "font-bold",
              name: "base_benchmark_plan_name",
              rules: { required: "* Required" },
            },
            {
              rhf: "Input",
              label:
                "Enter the specific name of the Section 1937 coverage option selected, if other than Secretary-approved. Otherwise, enter “Secretary-approved.”",
              labelStyling: "font-bold",
              name: "section_1937_coverage_option_name",
              rules: { required: "* Required" },
            },
          ],
        },
      ],
    },
    subsection({
      title: "1. Essential health benefit: Ambulatory patient services",
      namePrefix: "ambulatory_patient",
    }),
    subsection({
      title: "2. Essential health benefit: Emergency services",
      namePrefix: "emergency",
    }),
    subsection({
      title: "3. Essential health benefit: Hospitalization",
      namePrefix: "hospitalization",
    }),
    subsection({
      title: "4. Essential health benefit: Maternity and newborn care",
      namePrefix: "maternity_and_newborn_care",
    }),
    subsection({
      title:
        "5. Essential health benefit: Mental health and substance use disorder services including behavioral health treatment",
      namePrefix: "mental_health_and_substance_use_disorder",
      headerSlots: [
        {
          rhf: "Checkbox",
          name: "does_not_apply_financial_requirement_or_treatment_limitation",
          rules: { required: "* Required" },
          props: {
            options: [
              {
                label:
                  "The state/territory assures that it does not apply any financial requirement or treatment limitation to mental health or substance use disorder benefits in any classification that is more restrictive than the predominant financial requirement or treatment limitation of that type applied to substantially all medical/surgical benefits in the same classification.",
                value: "yes",
              },
            ],
          },
        },
      ],
    }),
    {
      title: "6. Essential health benefit: Prescription drugs",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "prescription_drug_benefit_same_as_medicaid_state_plan",
              props: {
                options: [
                  {
                    label:
                      "The state/territory assures that the ABP prescription drug benefit plan is the same as under the approved Medicaid state plan for prescribed drugs.",
                    value: "yes",
                  },
                ],
              },
            },
            {
              rhf: "Radio",
              label: "Prescription drug limits (check all that apply)",
              labelStyling: "font-bold",
              name: "prescription_drug_limits",
              props: {
                options: [
                  {
                    label: "Limit on days of supply",
                    value: "limit_on_days_of_supply",
                  },
                  {
                    label: "Limit on number of prescriptions",
                    value: "limit_on_number_of_prescriptions",
                  },
                  {
                    label: "Limit on brand drugs",
                    value: "limit_on_brand_drugs",
                  },
                  {
                    label: "Other coverage limits",
                    value: "other_coverage_limits",
                  },
                  {
                    label: "Preferred drug list",
                    value: "preferred_drug_list",
                  },
                ],
              },
            },
            {
              rhf: "Select",
              label: "Authorization",
              labelStyling: "font-bold",
              name: "prescription_drug_authorization",
              rules: { required: "* Required" },
              props: {
                className: "w-[300px]",
                options: [
                  {
                    label: "Yes",
                    value: "yes",
                  },
                  {
                    label: "No",
                    value: "no",
                  },
                ],
              },
            },
            {
              rhf: "Select",
              label: "Provider qualifications",
              labelStyling: "font-bold",
              name: "prescription_drug_provider_qualifications",
              rules: { required: "* Required" },
              props: {
                className: "w-[300px]",
                options: [
                  {
                    label: "State licensed",
                    value: "state_licensed",
                  },
                ],
              },
            },
            {
              rhf: "Input",
              label: "Coverage that exceeds the minimum requirements or other",
              labelStyling: "font-bold",
              name: "prescription_drug_other_information",
            },
            {
              rhf: "Radio",
              label:
                "Is there an EHB benchmark benefit duplicated or substituted?",
              labelStyling: "font-bold",
              name: "prescription_drug_benchmark_benefit_duplicated_or_substituted",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label: "Yes, a duplication",
                    value: "yes_duplication",
                  },
                  {
                    label: "Yes, a substitution",
                    value: "yes_substitution",
                  },
                  { label: "No", value: "no" },
                ],
              },
            },
          ],
        },
      ],
    },
    subsection({
      title:
        "7. Essential health benefit: Rehabilitative and habilitative services and devices",
      namePrefix: "rehabilitative_and_habilitative",
      headerSlots: [
        {
          rhf: "Checkbox",
          name: "rehabilitative_and_habilitative_does_not_apply_financial_requirement_or_treatment_limitation",
          rules: { required: "* Required" },
          props: {
            options: [
              {
                label:
                  "The state/territory assures that it does not apply any financial requirement or treatment limitation to mental health or substance use disorder benefits in any classification that is more restrictive than the predominant financial requirement or treatment limitation of that type applied to substantially all medical/surgical benefits in the same classification.",
                value: "yes",
              },
            ],
          },
        },
      ],
    }),
    subsection({
      title: "8. Essential health benefit: Laboratory services",
      namePrefix: "laboratory",
    }),
    subsection({
      title:
        "9. Essential health benefit: Preventive and wellness services and chronic disease management",
      namePrefix: "preventive_and_wellness",
      description:
        "The state/territory must provide, at a minimum, a broad range of preventive services, including “A” and “B” services recommended by the United States Preventive Services Task Force; vaccines recommended by the Advisory Committee for Immunization Practices (ACIP); preventive care and screening for infants, children, and adults recommended by the Health Resources and Services Administration (HRSA) Bright Futures program; and additional preventive services for women recommended by the Institute of Medicine (IOM).",
    }),
    subsection({
      title:
        "10. Essential health benefit: Pediatric services including oral and vision care",
      namePrefix: "pediatric",
    }),
  ],
};

export const form = ABP5;
