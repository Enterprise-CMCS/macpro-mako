import {
  DependencyRule,
  FormSchema,
  RHFSlotProps,
  Section,
  DefaultFieldGroupProps,
} from "shared-types";

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
  { label: "State plan 1905(a)", value: "state_plan_1905_a" },
  { label: "State plan 1915(i)", value: "state_plan_1915_i" },
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
  benefitProvided?: string;
  dependency?: DependencyRule;
  description?: string;
  headerSlots?: RHFSlotProps[];
  sectionName: string;
  showEHBBenchmark?: boolean;
  title: string;
}

interface SubsectionFieldProps {
  benefitProvided?: string;
  optionalSection?: boolean;
  sectionName: string;
}

function subsectionFormFields({
  benefitProvided,
  optionalSection = false,
  sectionName,
}: SubsectionFieldProps): RHFSlotProps[] {
  // The Authorization select menu in the optional sections should not include
  // the "None" option, accodring to HCD. This is because the original PDF did
  // not include a "None" option in those optional sections. So, we use
  // slice() to exclude the first option.
  const authOptions: { label: string; value: string }[] = optionalSection
    ? authorizationOptions.slice(1)
    : authorizationOptions;

  return [
    benefitProvided
      ? {
          rhf: "TextDisplay",
          label: "Benefit provided",
          labelClassName: "font-bold",
          name: "test",
          text: benefitProvided,
        }
      : {
          rhf: "Input",
          label: "Benefit provided",
          labelClassName: "font-bold",
          name: "benefit-provided",
          rules: {
            required: "* Required",
            pattern: {
              value: /^\S(.*\S)?$/,
              message: "Must not have leading or trailing whitespace.",
            },
          },
          props: {
            className: "w-[300px]",
          },
        },
    {
      rhf: "Select",
      label: "Source",
      labelClassName: "font-bold",
      name: "source",
      rules: { required: "* Required" },
      props: {
        className: "w-[300px]",
        options: benefitSourceOptions,
      },
    },
    {
      rhf: "Input",
      label:
        "Other information about this benefit source, including the name of the source plan",
      labelClassName: "font-bold",
      name: "source-other-info_input",
      formItemClassName: "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
      rules: {
        required: "* Required",
        pattern: {
          value: /^\S(.*\S)?$/,
          message: "Must not have leading or trailing whitespace.",
        },
      },
      dependency: {
        conditions: [
          {
            name: `${formName}_${sectionName}_source`,
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
        "Other information about this benefit source, including the name of the source plan",
      labelClassName: "font-bold",
      name: "secretary-other-info_input",
      formItemClassName: "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
      rules: {
        required: "* Required",
        pattern: {
          value: /^\S(.*\S)?$/,
          message: "Must not have leading or trailing whitespace.",
        },
      },
      dependency: {
        conditions: [
          {
            name: `${formName}_${sectionName}_source`,
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
      name: "auth",
      rules: { required: "* Required" },
      props: {
        className: "w-[300px]",
        options: authOptions,
      },
    },
    {
      rhf: "Input",
      label: "Other information about authorization",
      labelClassName: "font-bold",
      name: "authorization-other-info_input",
      formItemClassName: "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
      rules: {
        required: "* Required",
        pattern: {
          value: /^\S(.*\S)?$/,
          message: "Must not have leading or trailing whitespace.",
        },
      },
      dependency: {
        conditions: [
          {
            name: `${formName}_${sectionName}_auth`,
            type: "expectedValue",
            expectedValue: "other",
          },
        ],
        effect: { type: "show" },
      },
    },
    {
      rhf: "Select",
      label: "Provider qualifications",
      labelClassName: "font-bold",
      name: "provider-qual",
      rules: { required: "* Required" },
      props: {
        className: "w-[300px]",
        options: providerQualificationsOptions,
      },
    },
    {
      rhf: "Input",
      label: "Other information about provider qualifications",
      labelClassName: "font-bold",
      name: "provider-qual-other-info_input",
      formItemClassName: "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
      rules: {
        required: "* Required",
        pattern: {
          value: /^\S(.*\S)?$/,
          message: "Must not have leading or trailing whitespace.",
        },
      },
      dependency: {
        conditions: [
          {
            name: `${formName}_${sectionName}_provider-qual`,
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
      name: "amount-limit",
      rules: {
        required: "* Required",
        pattern: {
          value: /^[0-9]\d*$/,
          message: "Must be a positive integer value",
        },
      },
      props: {
        className: "w-[300px]",
      },
    },
    {
      rhf: "Input",
      label: "Duration limit",
      labelClassName: "font-bold",
      name: "duration-limit",
      rules: {
        required: "* Required",
        pattern: {
          value: /^[0-9]\d*$/,
          message: "Must be a positive integer value",
        },
      },
      props: {
        className: "w-[300px]",
      },
    },
    {
      rhf: "Input",
      label: "Scope limit",
      labelClassName: "font-bold",
      name: "scope-limit",
      rules: {
        required: "* Required",
        pattern: {
          value: /^[0-9]\d*$/,
          message: "Must be a positive integer value",
        },
      },
      props: {
        className: "w-[300px]",
      },
    },
  ];
}

function subsection({
  benefitProvided,
  dependency,
  description,
  headerSlots = [],
  sectionName,
  showEHBBenchmark = true,
  title,
}: SubsectionData): Section {
  return {
    title: title,
    dependency: dependency,
    subsection: true,
    sectionId: sectionName,
    form: [
      {
        description: description,
        descriptionClassName: "font-normal",
        slots: [
          ...headerSlots,
          {
            rhf: "FieldArray",
            name: "benefit",
            props: {
              ...DefaultFieldGroupProps,
              appendText: "Add benefit",
              removeText: "Remove benefit",
            },
            fields: [
              ...subsectionFormFields({
                sectionName: sectionName,
                benefitProvided: benefitProvided,
              }),
              ...(showEHBBenchmark
                ? ([
                    {
                      rhf: "Radio",
                      label:
                        "Is there an EHB-benchmark benefit duplicated or substituted?",
                      labelClassName: "font-bold",
                      name: "benefit-dupe-or-sub",
                      rules: { required: "* Required" },
                      props: {
                        options: [
                          {
                            label: "Yes, a duplication",
                            value: `${sectionName}_yes_duplication`,
                            form: [
                              {
                                slots: [
                                  {
                                    rhf: "Input",
                                    label: "Benefit duplicated",
                                    labelClassName: "font-bold",
                                    name: "benefit-duped",
                                    rules: {
                                      required: "* Required",
                                      pattern: {
                                        value: /^\S(.*\S)?$/,
                                        message:
                                          "Must not have leading or trailing whitespace.",
                                      },
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                          {
                            label: "Yes, a substitution",
                            value: `${sectionName}_yes_substitution`,
                            form: [
                              {
                                slots: [
                                  {
                                    rhf: "Input",
                                    label: "Benefit substituted",
                                    labelClassName: "font-bold",
                                    name: "benefit-subbed",
                                    rules: {
                                      required: "* Required",
                                      pattern: {
                                        value: /^\S(.*\S)?$/,
                                        message:
                                          "Must not have leading or trailing whitespace.",
                                      },
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                          { label: "No", value: `${sectionName}_no` },
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

const initialDependency: DependencyRule = {
  conditions: [
    {
      name: `${formName}_alignment_benefits-align`,
      type: "expectedValue",
      expectedValue: "no",
    },
  ],
  effect: { type: "show" },
};

export const v202401: FormSchema = {
  header: "ABP 5: Benefits description",
  formId: "abp5",
  sections: [
    {
      title: "State plan alignment",
      sectionId: "alignment",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label:
                "Does this description of benefits align with the traditional state plan?",
              labelClassName: "font-bold",
              name: "benefits-align",
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
      sectionId: "desc-of-benefits",
      dependency: initialDependency,
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label:
                "Does the state/territory propose a benchmark-equivalent benefit package?",
              labelClassName: "font-bold",
              name: "benchmark-equivalent-pkg",
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
      dependency: initialDependency,
      sectionId: "benefits-included",
      form: [
        {
          slots: [
            {
              rhf: "Input",
              label: "Name of selected base benchmark plan",
              labelClassName: "font-bold",
              name: "plan-name",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
            {
              rhf: "Input",
              label:
                "Name of selected Section 1937 coverage option if other than Secretary-approved. Otherwise, enter “Secretary-approved.”",
              labelClassName: "font-bold",
              name: "section-1937-name",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
          ],
        },
      ],
    },
    subsection({
      title: "1. Essential health benefit: Ambulatory patient services",
      sectionName: "ambulatory-patient",
      dependency: initialDependency,
    }),
    subsection({
      title: "2. Essential health benefit: Emergency services",
      sectionName: "emergency",
      dependency: initialDependency,
    }),
    subsection({
      title: "3. Essential health benefit: Hospitalization",
      sectionName: "hospitalization",
      dependency: initialDependency,
    }),
    subsection({
      title: "4. Essential health benefit: Maternity and newborn care",
      sectionName: "maternity-newborn-care",
      dependency: initialDependency,
    }),
    subsection({
      title:
        "5. Essential health benefit: Mental health and substance use disorder services including behavioral health treatment",
      sectionName: "mental-health-substance",
      dependency: initialDependency,
      headerSlots: [
        {
          rhf: "Checkbox",
          name: "mental-health-substance_no-financial-req-treatment-limit",
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
      sectionId: "prescrip-drugs",
      subsection: true,
      dependency: initialDependency,
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "same-as-medicaid-state-plan",
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
              name: "benefit-provided",
              text: "Benefit provided",
              props: {
                className: "font-bold",
              },
            },
            {
              rhf: "TextDisplay",
              name: "benefit_desc",
              text: "Coverage is at least the greater of one drug in each U.S. Pharmacopeia (USP) category and class or the same number of prescription drugs in each category and class as the base benchmark.",
            },
            {
              rhf: "Checkbox",
              label: "Prescription drug limits",
              labelClassName: "font-bold",
              name: `${formName}_prescrip-drugs-limits`,
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
              name: "auth",
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
              name: "provider-qual",
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
              name: "other-info",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
            {
              rhf: "Radio",
              label:
                "Is there an EHB-benchmark benefit duplicated or substituted?",
              labelClassName: "font-bold",
              name: "benefit-dup-or-sub",
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
                            name: "benefit-duped",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: /^\S(.*\S)?$/,
                                message:
                                  "Must not have leading or trailing whitespace.",
                              },
                            },
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
                            name: "benefit-subbed",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: /^\S(.*\S)?$/,
                                message:
                                  "Must not have leading or trailing whitespace.",
                              },
                            },
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
    subsection({
      title:
        "7. Essential health benefit: Rehabilitative and habilitative services and devices",
      sectionName: "rehabilitative-and-habilitative",
      dependency: initialDependency,
      headerSlots: [
        {
          rhf: "Checkbox",
          name: "rehab_no-limits",
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
      dependency: initialDependency,
    }),
    subsection({
      title:
        "9. Essential health benefit: Preventive and wellness services and chronic disease management",
      sectionName: "preventive-and-wellness",
      dependency: initialDependency,
      description:
        "The state/territory must provide, at a minimum, a broad range of preventive services, including “A” and “B” services recommended by the United States Preventive Services Task Force; vaccines recommended by the Advisory Committee for Immunization Practices (ACIP); preventive care and screening for infants, children, and adults recommended by the Health Resources and Services Administration (HRSA) Bright Futures program; and additional preventive services for women recommended by the Institute of Medicine (IOM).",
    }),
    subsection({
      title:
        "10. Essential health benefit: Pediatric services including oral and vision care",
      sectionName: "pediatric",
      dependency: initialDependency,
      benefitProvided: "Medicaid State Plan EPSDT Benefits",
    }),
    {
      title: "Optional items",
      sectionId: "opt-items",
      dependency: initialDependency,
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "opt-items",
              props: {
                options: [
                  {
                    label:
                      "11. Other covered benefits that are not essential health benefits",
                    optionlabelClassName:
                      "text-2xl font-bold p-4 bg-gray-300 py-4 px-8 w-full leading-9 text-primary",
                    value: "other_covered_benefits_benefit",
                    form: [
                      {
                        slots: [
                          {
                            rhf: "FieldArray",
                            name: "other-non-essential",
                            props: {
                              ...DefaultFieldGroupProps,
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
                      "text-2xl font-bold p-4 bg-gray-300 py-4 px-8 w-full leading-9 text-primary",
                    value: "other_base_benchmark_benefits_not_covered",
                    form: [
                      {
                        slots: [
                          {
                            rhf: "FieldArray",
                            name: "other-base",
                            props: {
                              ...DefaultFieldGroupProps,
                              appendText: "Add item",
                              removeText: "Remove item",
                            },
                            fields: [
                              {
                                rhf: "Input",
                                label:
                                  "Base benchmark benefit that was substituted",
                                labelClassName: "font-bold",
                                rules: {
                                  required: "* Required",
                                  pattern: {
                                    value: /^\S(.*\S)?$/,
                                    message:
                                      "Must not have leading or trailing whitespace.",
                                  },
                                },
                                name: "benchmark-subbed",
                              },
                              {
                                rhf: "TextDisplay",
                                text: [
                                  { text: "Benefit provided", type: "bold" },
                                  { text: "Base benchmark", type: "br" },
                                ],
                                name: "benefit-provided",
                              },
                              {
                                rhf: "Textarea",
                                label:
                                  "Why did the state/territory choose to exclude this benefit?",
                                labelClassName: "font-bold",
                                rules: { required: "* Required" },
                                name: "explanation_textarea",
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
                      "text-2xl font-bold p-4 bg-gray-300 py-4 px-8 w-full leading-9 text-primary",
                    value: "additional_covered_benefits",
                    form: [
                      {
                        slots: [
                          {
                            rhf: "FieldArray",
                            name: "add-benefits",
                            props: {
                              ...DefaultFieldGroupProps,
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
