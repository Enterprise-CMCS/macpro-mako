import { FormSchema, Section } from "shared-types";

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

const subsection: (title: string, namePrefix: string) => Section = function (
  title,
  namePrefix
) {
  return {
    title: title,
    subSection: true,
    form: [
      {
        slots: [
          {
            rhf: "Input",
            label: "Benefit provided",
            labelStyling: "font-bold",
            name: `${namePrefix}_benefit_provided`,
            rules: { required: "Required" },
            props: {
              className: "w-[300px]",
            },
          },
          {
            rhf: "Select",
            label: "Source",
            labelStyling: "font-bold",
            name: `${namePrefix}_source`,
            rules: { required: "Required" },
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
            rules: { required: "Required" },
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
            rules: { required: "Required" },
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
            rules: { required: "Required" },
            props: {
              className: "w-[300px]",
            },
          },
          {
            rhf: "Select",
            label: "Provider qualifications",
            labelStyling: "font-bold",
            name: `${namePrefix}_provider_qualifications`,
            rules: { required: "Required" },
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
            rules: { required: "Required" },
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
            rules: { required: "Required" },
            props: {
              className: "w-[300px]",
            },
          },
          {
            rhf: "Input",
            label: "Duration limit",
            labelStyling: "font-bold",
            name: `${namePrefix}_duration_limit`,
            rules: { required: "Required" },
            props: {
              className: "w-[300px]",
            },
          },
          {
            rhf: "Input",
            label: "Scope limit",
            labelStyling: "font-bold",
            name: `${namePrefix}_scope_limit`,
            rules: { required: "Required" },
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
            rules: { required: "Required" },
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
                          rules: { required: "Required" },
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
                          rules: { required: "Required" },
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
  };
};

/*
  "Ambulatory patient services",
  "Emergency services",
  "Hospitalization",
  "Maternity and newborn care",
  "Mental health and substance use disorder services including behavioral health treatment",
  "Prescription drugs",
  "Rehabilitative and habilitative services and devices",
  "Laboratory services",
  "Preventive and wellness services and chronic disease management",
  "Pediatric services including oral and vision care",
*/

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
              rules: { required: "Required" },
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
              rules: { required: "Required" },
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
              rules: { required: "Required" },
            },
            {
              rhf: "Input",
              label:
                "Enter the specific name of the Section 1937 coverage option selected, if other than Secretary-approved. Otherwise, enter “Secretary-approved.”",
              labelStyling: "font-bold",
              name: "section_1937_coverage_option_name",
              rules: { required: "Required" },
            },
          ],
        },
      ],
    },
    subsection(
      "1. Essential health benefit: Ambulatory patient services",
      "ambulatory_patient"
    ),
    subsection(
      "2. Essential health benefit: Emergency services",
      "emergency_services"
    ),
    subsection(
      "3. Essential health benefit: Hospitalization",
      "hospitalization"
    ),
    subsection(
      "4. Essential health benefit: Maternity and newborn care",
      "maternity_and_newborn_care"
    ),
  ],
};

export const form = ABP5;
