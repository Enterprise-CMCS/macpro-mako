import { FormSchema, RHFSlotProps, Section } from "shared-types";

const formName = "abp5";

const benefitSourceOptions = [
  {
    label: "Base benchmark small group",
    value: "base-benchmark-small-group",
  },
  {
    label: "Base benchmark federal employees",
    value: "base-benchmark-federal-employees",
  },
  {
    label: "Base benchmark state employees",
    value: "base_benchmark_state_employees",
  },
  {
    label: "Base benchmark commercial HMO",
    value: "base_benchmark_commercial_hmo",
  },
  { label: "1937 federal BC/BS", value: "1937_federal_bc_bs" },
  {
    label: "1937 state employees",
    value: "1937_state_employees",
  },
  {
    label: "1937 commercial HMO",
    value: "1937_commercial_hmo",
  },
  { label: "State plan 1915(i)", value: "state_plan_1915_i" },
  { label: "State plan 1905(a)", value: "state_plan_1905_a" },
  { label: "State plan 1915(j)", value: "state_plan_1915_j" },
  { label: "State plan 1915(k)", value: "state_plan_1915_k" },
  { label: "State plan 1945", value: "state_plan_1945" },
  { label: "State plan other", value: "state_plan_other" },
  { label: "Secretary-approved other", value: "secretary_approved_other" },
];

const providerQualificationsOptions = [
  { label: "Medicaid state plan", value: "medicaid_state_plan" },
  {
    label: "Selected public employee/commercial plan",
    value: "selected_public_employee_commercial_plan",
  },
  {
    label: "State plan and public employee/commercial plan",
    value: "state_plan_public_employee_commercial_plan",
  },
  { label: "Other", value: "other" },
];

const authorizationOptions = [
  {
    label: "None",
    value: "none",
  },
  {
    label: "Prior authorization",
    value: "prior_authorization",
  },
  {
    label: "Authorization required in excess of limitation",
    value: "excess_of_limitation",
  },
  {
    label: "Concurrent authorization",
    value: "concurrent_authorization",
  },
  {
    label: "Retroactive authorization",
    value: "retroactive_authorization",
  },
  {
    label: "Other",
    value: "other",
  },
];

interface SubsectionData {
  title: string;
  sectionName: string;
  description?: string;
  headerSlots?: RHFSlotProps[];
  showEHBBenchmark?: boolean;
}

interface SubsectionFieldProps {
  sectionName: string;
  optionalSection?: boolean;
}

function subsectionFormFields({
  sectionName,
  optionalSection = false,
}: SubsectionFieldProps): RHFSlotProps[] {
  // The Authorization select menu in the optional sections should not include
  // the "None" option, accodring to HCD. This is because the original PDF did
  // not include a "None" option in those optional sections. So, we use
  // slice() to exclude the first option.
  const authOptions: { label: string; value: string }[] = optionalSection
    ? authorizationOptions.slice(1)
    : authorizationOptions;

  return [
    {
      rhf: "Input",
      label: "Benefit provided",
      labelClassName: "font-bold",
      name: `${formName}_${sectionName}_benefit-provided_input`,
      rules: { required: "* Required" },
      props: {
        className: "w-[300px]",
      },
    },
    {
      rhf: "Select",
      label: "Source",
      labelClassName: "font-bold",
      name: `${formName}_${sectionName}_source_select`,
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
      labelClassName: "font-bold",
      name: `${formName}_${sectionName}_source-other-info_input`,
      formItemClassName: "ml-[0.6rem] px-4 border-l-4 border-l-primary",
      rules: { required: "* Required" },
      dependency: {
        conditions: [
          {
            name: `${formName}_${sectionName}_source_select`,
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
      labelClassName: "font-bold",
      name: `${formName}_${sectionName}_secretary-other-info_input`,
      formItemClassName: "ml-[0.6rem] px-4 border-l-4 border-l-primary",
      rules: { required: "* Required" },
      dependency: {
        conditions: [
          {
            name: `${formName}_${sectionName}_source_select`,
            type: "expectedValue",
            expectedValue: "secretary_approved_other",
          },
        ],
        effect: { type: "show" },
      },
    },
    {
      rhf: "Select",
      label: "Authorization",
      labelClassName: "font-bold",
      name: `${formName}_${sectionName}_auth_select`,
      rules: { required: "* Required" },
      props: {
        className: "w-[300px]",
        options: authOptions,
      },
    },
    {
      rhf: "Select",
      label: "Provider qualifications",
      labelClassName: "font-bold",
      name: `${formName}_${sectionName}_provider-qual_select`,
      rules: { required: "* Required" },
      props: {
        className: "w-[300px]",
        options: providerQualificationsOptions,
      },
    },
    {
      rhf: "Input",
      label: "Other information regarding provider qualifications",
      labelClassName: "font-bold",
      name: `${formName}_${sectionName}_provider-qual-other-info_input`,
      formItemClassName: "ml-[0.6rem] px-4 border-l-4 border-l-primary",
      rules: { required: "* Required" },
      dependency: {
        conditions: [
          {
            name: `${formName}_${sectionName}_provider-qual_select`,
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
      labelClassName: "font-bold",
      name: `${formName}_${sectionName}_amount-limit_input`,
      rules: { required: "* Required" },
      props: {
        className: "w-[300px]",
      },
    },
    {
      rhf: "Input",
      label: "Duration limit",
      labelClassName: "font-bold",
      name: `${formName}_${sectionName}_duration-limit_input`,
      rules: { required: "* Required" },
      props: {
        className: "w-[300px]",
      },
    },
    {
      rhf: "Input",
      label: "Scope limit",
      labelClassName: "font-bold",
      name: `${formName}_${sectionName}_scope-limit_input`,
      rules: { required: "* Required" },
      props: {
        className: "w-[300px]",
      },
    },
  ];
}

function subsection({
  title,
  sectionName,
  description,
  headerSlots = [],
  showEHBBenchmark = true,
}: SubsectionData): Section {
  return {
    title: title,
    subsection: true,
    form: [
      {
        description: description,
        descriptionClassName: "font-normal",
        slots: [
          {
            rhf: "FieldGroup",
            name: `${formName}_${sectionName}_benefit`,
            groupNamePrefix: `${formName}_${sectionName}_benefit`,
            props: {
              appendText: "Add benefit",
              removeText: "Remove benefit",
            },
            fields: [
              ...headerSlots,
              ...subsectionFormFields({ sectionName: sectionName }),
              ...(showEHBBenchmark
                ? ([
                    {
                      rhf: "Radio",
                      label:
                        "Is there an EHB-benchmark benefit duplicated or substituted?",
                      labelClassName: "font-bold",
                      name: `${formName}_${sectionName}_benefit-dupe-or-sub_radio`,
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
                                    labelClassName: "font-bold",
                                    name: `${formName}_${sectionName}_benefit-duped_input`,
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
                                    labelClassName: "font-bold",
                                    name: `${formName}_${sectionName}_benefit-subbed_input`,
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
                  ] as RHFSlotProps[])
                : []),
            ],
          },
        ],
      },
    ],
  };
}

export const v202401: FormSchema = {
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
              labelClassName: "font-bold",
              name: `${formName}_alignment_benefits-align_select`,
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
              labelClassName: "font-bold",
              name: `${formName}_desc-of-benefits_benchmark-equivalent-pkg_select`,
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
      title: "Benefits included",
      form: [
        {
          slots: [
            {
              rhf: "Input",
              label: "Name of selected base benchmark plan",
              labelClassName: "font-bold",
              name: `${formName}_benefits-included_plan-name_input`,
              rules: { required: "* Required" },
            },
            {
              rhf: "Input",
              label:
                "Name of selected Section 1937 coverage option if other than Secretary-approved. Otherwise, enter “Secretary-approved.”",
              labelClassName: "font-bold",
              name: `${formName}_benefits-included_section-1937-name_input`,
              rules: { required: "* Required" },
            },
          ],
        },
      ],
    },
    subsection({
      title: "1. Essential health benefit: Ambulatory patient services",
      sectionName: "ambulatory-patient",
    }),
    subsection({
      title: "2. Essential health benefit: Emergency services",
      sectionName: "emergency",
    }),
    subsection({
      title: "3. Essential health benefit: Hospitalization",
      sectionName: "hospitalization",
    }),
    subsection({
      title: "4. Essential health benefit: Maternity and newborn care",
      sectionName: "maternity-newborn-care",
    }),
    subsection({
      title:
        "5. Essential health benefit: Mental health and substance use disorder services including behavioral health treatment",
      sectionName: "mental-health-substance",
      headerSlots: [
        {
          rhf: "Checkbox",
          name: `${formName}_mental-health-substance_no-financial-req-treatment-limit_checkbox`,
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
              name: `${formName}_prescrip-drugs_same-as-medicaid-state-plan_checkbox`,
              rules: { required: "* Required" },
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
              rhf: "TextDisplay",
              name: `${formName}_prescrip-drugs_benefit-provided_textdisplay`,
              text: "Benefit provided",
              props: {
                className: "font-bold",
              },
            },
            {
              rhf: "TextDisplay",
              name: `${formName}_prescrip-drugs_benefit_desc_textdisplay`,
              text: "Coverage is at least the greater of one drug in each U.S. Pharmacopeia (USP) category and class or the same number of prescription drugs in each category and class as the base benchmark.",
            },
            {
              rhf: "Radio",
              label: "Prescription drug limits",
              labelClassName: "font-bold",
              name: `${formName}_prescrip-drugs_limits_radio`,
              rules: { required: "* Required" },
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
              labelClassName: "font-bold",
              name: `${formName}_prescrip-drugs_auth_select`,
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
              labelClassName: "font-bold",
              name: `${formName}_prescrip-drugs_provider-qual_select`,
              rules: { required: "* Required" },
              props: {
                className: "w-[300px]",
                options: [
                  {
                    label: "State-licensed",
                    value: "state_licensed",
                  },
                ],
              },
            },
            {
              rhf: "Input",
              label:
                "Coverage that exceeds the minimum requirements or other information",
              labelClassName: "font-bold",
              name: `${formName}_prescrip-drugs_other-info_input`,
              rules: { required: "* Required" },
            },
            {
              rhf: "Radio",
              label:
                "Is there an EHB-benchmark benefit duplicated or substituted?",
              labelClassName: "font-bold",
              name: `${formName}_prescrip-drugs_benefit-dup-or-sub_radio`,
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
      sectionName: "rehabilitative-and-habilitative",
      headerSlots: [
        {
          rhf: "Checkbox",
          name: `${formName}_rehab_no-limits_checkbox`,
          rules: { required: "* Required" },
          props: {
            options: [
              {
                label:
                  "The state/territory assures it's not imposing limits on habilitative services and devices that are more stringent than limits on rehabilitative services (45 CFR 156.115(a)(5)(ii)). The state/territory also understands that separate coverage limits must be established for rehabilitative and habilitative services and devices. Combined rehabilitative and habilitative limits are allowed if these limits can be exceeded based on medical necessity.",
                value: "yes",
              },
            ],
          },
        },
      ],
    }),
    subsection({
      title: "8. Essential health benefit: Laboratory services",
      sectionName: "laboratory",
    }),
    subsection({
      title:
        "9. Essential health benefit: Preventive and wellness services and chronic disease management",
      sectionName: "preventive-and-wellness",
      description:
        "The state/territory must provide, at a minimum, a broad range of preventive services, including “A” and “B” services recommended by the United States Preventive Services Task Force; vaccines recommended by the Advisory Committee for Immunization Practices (ACIP); preventive care and screening for infants, children, and adults recommended by the Health Resources and Services Administration (HRSA) Bright Futures program; and additional preventive services for women recommended by the Institute of Medicine (IOM).",
    }),
    subsection({
      title:
        "10. Essential health benefit: Pediatric services including oral and vision care",
      sectionName: "pediatric",
    }),
    {
      title: "Optional items",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: `${formName}_opt-items_opt-items_checkbox`,
              props: {
                options: [
                  {
                    label:
                      "11. Other covered benefits that are not essential health benefits",
                    optionlabelClassName:
                      "text-2xl font-bold p-4 bg-gray-300 py-4 px-8 w-full",
                    value: "other_covered_benefits_benefit",
                    form: [
                      {
                        slots: [
                          {
                            rhf: "FieldGroup",
                            name: `${formName}_opt-items_other-non-essential_fieldgroup`,
                            groupNamePrefix: "other_covered_benefits_benefit",
                            props: {
                              appendText: "Add benefit",
                              removeText: "Remove benefit",
                            },
                            fields: [
                              ...subsectionFormFields({
                                sectionName: "other-covered-benefits",
                                optionalSection: true,
                              }),
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    label: "12. Other base benchmark benefits not covered",
                    optionlabelClassName:
                      "text-2xl font-bold p-4 bg-gray-300 py-4 px-8 w-full",
                    value: "other_base_benchmark_benefits_not_covered",
                    form: [
                      {
                        slots: [
                          {
                            rhf: "FieldGroup",
                            name: `${formName}_opt-items_other-base_fieldgroup`,
                            groupNamePrefix:
                              "other_base_benchmark_benefits_not_covered",
                            props: {
                              appendText: "Add benefit",
                              removeText: "Remove benefit",
                            },
                            fields: [
                              {
                                rhf: "Input",
                                label:
                                  "Base benchmark benefit that was substituted",
                                labelClassName: "font-bold",
                                rules: { required: "* Required" },
                                name: `${formName}_opt-items_benchmark-subbed_input`,
                              },
                              {
                                rhf: "TextDisplay",
                                text: [
                                  { text: "Benefit provided", type: "bold" },
                                  { text: "Base benchmark", type: "br" },
                                ],
                                name: `${formName}_opt-items_benefit-provided_textdisplay`,
                              },
                              {
                                rhf: "Textarea",
                                label:
                                  "Why did the state or territory choose to exclude this benefit?",
                                labelClassName: "font-bold",
                                rules: { required: "* Required" },
                                name: `${formName}_opt-items_explanation_textarea`,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    label:
                      "13. Additional covered benefits (not applicable to “adult” group under Section 1902(a)(10)(A)(i)(VIII) of the Act)",
                    optionlabelClassName:
                      "text-2xl font-bold p-4 bg-gray-300 py-4 px-8 w-full",
                    value: "additional_covered_benefits",
                    form: [
                      {
                        slots: [
                          {
                            rhf: "FieldGroup",
                            name: `${formName}_add-benefits_add-benefits_fieldgroup`,
                            groupNamePrefix: "additional_covered_benefits",
                            props: {
                              appendText: "Add benefit",
                              removeText: "Remove benefit",
                            },
                            fields: [
                              ...subsectionFormFields({
                                sectionName: "add-benefits",
                                optionalSection: true,
                              }),
                            ],
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
  ],
};
