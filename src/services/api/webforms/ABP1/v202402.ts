import { FormSchema } from "shared-types";

export const v202402: FormSchema = {
  header: "ABP 1: Alternative Benefit Plan populations",
  formId: "abp1",
  sections: [
    {
      title: "Population identification",
      sectionId: "pop-id",
      form: [
        {
          description:
            "Define the population that will participate in this Alternative Benefit Plan (ABP).",
          slots: [
            {
              rhf: "Input",
              name: "abp-pop-name",
              label: "ABP package name",
              labelClassName: "font-bold",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              props: { placeholder: "enter name" },
            },
          ],
        },
        {
          description: "Identify eligibility groups that are included.",
          slots: [
            {
              rhf: "FieldArray",
              name: "eligibility-groups",
              props: {
                appendText: "Add group",
              },
              fields: [
                {
                  rhf: "Select",
                  name: "eligibility-group",
                  rules: {
                    required: "* Required",
                  },
                  label: "Eligibility group",
                  labelClassName: "font-bold",
                  props: {
                    sort: "ascending",
                    className: "w-[300px]",
                    options: [
                      {
                        label: "Parents and Other Caretaker Relatives",
                        value: "parents_caretaker_relatives",
                      },
                      {
                        label: "Transitional Medical Assistance",
                        value: "transitional_medical_assist",
                      },
                      {
                        label:
                          "Extended Medicaid Due to Spousal Support Collections",
                        value: "extend_medicaid_spousal_support_collect",
                      },
                      {
                        label: "Pregnant Women",
                        value: "pregnant_women",
                      },
                      {
                        label: "Deemed Newborns",
                        value: "deemed_newborns",
                      },
                      {
                        label: "Infants and Children under Age 19",
                        value: "infants_children_under_19",
                      },
                      {
                        label:
                          "Children with Title IV-E Adoption Assistance, Foster Care or Guardianship Care",
                        value:
                          "children_title_IV-E_adoption_assist_foster_guardianship_care",
                      },
                      {
                        label: "Former Foster Care Children",
                        value: "former_foster_children",
                      },
                      {
                        label: "Adult Group",
                        value: "adult_group",
                      },
                      {
                        label: "SSI Beneficiaries",
                        value: "ssi_beneficiaries",
                      },
                      {
                        label:
                          "Aged, Blind and Disabled Individuals in 209(b) States",
                        value: "aged_blind_disabled_individuals_209b_states",
                      },
                      {
                        label:
                          "Individuals Receiving Mandatory State Supplements",
                        value:
                          "individuals_receiving_mandatory_state_supplements",
                      },
                      {
                        label: "Individuals Who Are Essential Spouses",
                        value: "essential_spouses",
                      },
                      {
                        label: "Institutionalized Individuals Eligible in 1973",
                        value: "institutionalized_eligible_1973",
                      },
                      {
                        label: "Blind or Disabled Individuals Eligible in 1937",
                        value: "blind_disabled_eligible_1937",
                      },
                      {
                        label:
                          "Individuals Who Lost Eligibility for SSI/SSP Due to an Increase in OASDI Benefits in 1972",
                        value:
                          "lost_eligibility_SSI_SSP_increase_in_OASDI_benefits_1972",
                      },
                      {
                        label:
                          "Individuals Eligible for SSI/SSP but for OASDI COLA increases since April, 1977",
                        value:
                          "eligible_SSI_SSP_but_for_OASDI_COLA_increases_April_1977",
                      },
                      {
                        label:
                          "Disabled Widows and Widowers Ineligible for SSI due to Increase in OASDI",
                        value:
                          "disabled_widows_ineligible_SSI_due_to_increase_OASDI",
                      },
                      {
                        label:
                          "Disabled Widows and Widowers Ineligible for SSI due to Early Receipt of Social Security",
                        value:
                          "disabled_widows_ineligible_SSI_due_to_early_receipt_social_security",
                      },
                      {
                        label: "Working Disabled under 1619(b)",
                        value: "working_disabled_under_1619b",
                      },
                      {
                        label: "Disabled Adult Children",
                        value: "disabled_adult_children",
                      },
                      {
                        label:
                          "Optional Coverage of Parents and Other Caretaker Relatives",
                        value: "opt_coverage_parents_other_caretaker_relatives",
                      },
                      {
                        label:
                          "Reasonable Classifications of Individuals under Age 21",
                        value: "reasonable_class_under_21",
                      },
                      {
                        label: "Children with Non-IV-E Adoption Assistance",
                        value: "children_Non-IV-E_adoption_assistance",
                      },
                      {
                        label: "Independent Foster Care Adolescents",
                        value: "independent_foster_care_adolescents",
                      },
                      {
                        label: "Optional Targeted Low Income Children",
                        value: "opt_targeted_low_income_children",
                      },
                      {
                        label:
                          "Certain Individuals Needing Treatment for Breast or Cervical Cancer",
                        value:
                          "individuals_need_treatment_for_breasts_cervical_cancer",
                      },
                      {
                        label: "Individuals with Tuberculosis",
                        value: "tuberculosis",
                      },
                      {
                        label:
                          "Aged, Blind or Disabled Individuals Eligible for but Not Receiving Cash",
                        value:
                          "aged_blind_disabled_eligible_but_not_receiving_cash",
                      },
                      {
                        label:
                          "Individuals Eligible for Cash except for Institutionalization",
                        value: "eligible_cash_except_for_institutionalization",
                      },
                      {
                        label:
                          "Individuals Receiving Home and Community Based Services under Institutional Rules",
                        value:
                          "receiving_home_community_services_under_inst_rule",
                      },
                      {
                        label:
                          "Optional State Supplement - 1634 States and SSI Criteria States with 1616 Agreements",
                        value:
                          "opt_state_supp_1634_states_SSI_criteria_states_1616_agreements",
                      },
                      {
                        label:
                          "Optional State Supplement - 209(b) States and SSI Criteria States without 1616 Agreements",
                        value:
                          "opt_state_supp_209b_states_SSI_criteria_states_without_1616_agreements",
                      },
                      {
                        label:
                          "Institutionalized Individuals Eligible under a Special Income Level",
                        value: "inst_eligible_under_special_income_level",
                      },
                      {
                        label: "Individuals Receiving Hospice Care",
                        value: "hospice_care",
                      },
                      {
                        label: "Qualified Disabled Children under Age 19 ",
                        value: "qualified_disabled_children_under_19",
                      },
                      {
                        label: "Poverty Level Aged or Disabled",
                        value: "poverty_level_aged_disabled",
                      },
                      {
                        label: "Work Incentives Eligibility Group",
                        value: "work_incentives_eligibility_group",
                      },
                      {
                        label: "Ticket to Work Basic Group",
                        value: "ticket_work_basic_group",
                      },
                      {
                        label: "Ticket to Work Medical Improvements Group",
                        value: "ticket_work_medical_imp_group",
                      },
                      {
                        label:
                          "Family Opportunity Act Children with Disabilities",
                        value: "family_opportunity_act_children_disabilities",
                      },
                      {
                        label: "Medically Needy Pregnant Women",
                        value: "med_needy_pregnant_women",
                      },
                      {
                        label: "Medically Needy Children under Age 18",
                        value: "med_needy_children_under_18",
                      },
                      {
                        label: "Medically Needy Children Age 18 through 20",
                        value: "med_needy_age_18_through_20",
                      },
                      {
                        label: "Medically Needy Parents and Other Caretakers",
                        value: "med_needy_parents_caretakers",
                      },
                      {
                        label: "Medically Needy Aged, Blind or Disabled",
                        value: "med_needy_aged_blind_disabled",
                      },
                      {
                        label:
                          "Medically Needy Blind or Disabled Individuals Eligible in 1973",
                        value: "med_needy_blind_disabled_eligible_1973",
                      },
                    ],
                  },
                },
                {
                  rhf: "Select",
                  name: "mandatory-voluntary",
                  label: "Mandatory or voluntary",
                  labelClassName: "font-bold",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    className: "w-[300px]",
                    options: [
                      {
                        label: "Mandatory",
                        value: "mandatory",
                      },
                      {
                        label: "Voluntary",
                        value: "voluntary",
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          description:
            "Is enrollment available for all individuals in these eligibility groups?",
          slots: [
            {
              rhf: "Select",
              name: "is-enroll-avail",
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
          ],
        },
      ],
    },
    {
      title: "Targeting criteria",
      sectionId: "target-criteria",
      dependency: {
        conditions: [
          {
            name: "abp1_pop-id_is-enroll-avail",
            type: "expectedValue",
            expectedValue: "no",
          },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          description: "Targeting criteria",
          slots: [
            {
              rhf: "Checkbox",
              name: "target-criteria",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    value: "income_standard",
                    label: "Income standard",
                    form: [
                      {
                        description: "Income standard target",
                        slots: [
                          {
                            rhf: "Radio",
                            name: "income-target",
                            rules: {
                              required: "* Required",
                            },
                            props: {
                              options: [
                                {
                                  label:
                                    "Households with income at or below the standard",
                                  value: "income_target_below",
                                },
                                {
                                  label:
                                    "Households with income above the standard",
                                  value: "income_target_above",
                                },
                              ],
                            },
                          },
                        ],
                      },
                      {
                        description: "Income standard definition",
                        slots: [
                          {
                            rhf: "Radio",
                            name: "income-def",
                            rules: {
                              required: "* Required",
                            },
                            props: {
                              options: [
                                {
                                  label: "A percentage",
                                  value: "income_definition_percentage",
                                  slots: [
                                    {
                                      rhf: "Radio",
                                      name: "income-def-percent",
                                      rules: {
                                        required: "* Required",
                                      },
                                      props: {
                                        options: [
                                          {
                                            label: "Federal poverty level",
                                            value: "federal_poverty_level",
                                            slots: [
                                              {
                                                rhf: "Input",
                                                props: {
                                                  icon: "%",
                                                },
                                                rules: {
                                                  pattern: {
                                                    value: /^\d*\.?\d+$/,
                                                    message:
                                                      "Must be a positive percentage",
                                                  },
                                                  required: "* Required",
                                                },
                                                name: "fed-poverty-level-percent",
                                                label:
                                                  "Percentage of federal poverty level",
                                                labelClassName: "font-bold",
                                              },
                                            ],
                                          },
                                          {
                                            label: "SSI federal benefit amount",
                                            value: "ssi_federal_benefit_amount",
                                            slots: [
                                              {
                                                rhf: "Input",
                                                name: "ssi-fed-benefit-percentage",
                                                label:
                                                  "Percentage of SSI federal benefit",
                                                labelClassName: "font-bold",
                                                props: {
                                                  icon: "%",
                                                },
                                                rules: {
                                                  pattern: {
                                                    value: /^\d*\.?\d+$/,
                                                    message:
                                                      "Must be a positive percentage",
                                                  },
                                                  required: "* Required",
                                                },
                                              },
                                            ],
                                          },
                                          {
                                            label: "Other",
                                            value: "other",
                                            slots: [
                                              {
                                                rhf: "Input",
                                                name: "other-percentage",
                                                label: "Other percentage",
                                                labelClassName: "font-bold",
                                                props: {
                                                  icon: "%",
                                                },
                                                rules: {
                                                  pattern: {
                                                    value: /^\d*\.?\d+$/,
                                                    message:
                                                      "Must be a positive percentage",
                                                  },
                                                  required: "* Required",
                                                },
                                              },
                                              {
                                                rhf: "Textarea",
                                                name: "other-describe",
                                                label: "Describe",
                                                labelClassName: "font-bold",
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
                                    },
                                  ],
                                },
                                {
                                  label: "A specific amount",
                                  value: "income_definition_specific",
                                  slots: [
                                    {
                                      rhf: "Radio",
                                      name: "income-def-specific",
                                      rules: {
                                        required: "* Required",
                                      },
                                      props: {
                                        options: [
                                          {
                                            label: "Statewide standard",
                                            value: "statewide_standard",
                                            form: [
                                              {
                                                slots: [
                                                  {
                                                    rhf: "FieldArray",
                                                    name: "income-def-specific-state",
                                                    props: {
                                                      appendText:
                                                        "Add Standard",
                                                    },
                                                    fields: [
                                                      {
                                                        rhf: "Input",
                                                        label: "Household size",
                                                        labelClassName:
                                                          "font-bold",
                                                        name: "house-size",
                                                        props: {
                                                          placeholder:
                                                            "enter size",
                                                          className:
                                                            "w-[300px]",
                                                        },
                                                        rules: {
                                                          pattern: {
                                                            value: /^[0-9]\d*$/,
                                                            message:
                                                              "Must be a positive integer value",
                                                          },
                                                          required:
                                                            "* Required",
                                                        },
                                                      },
                                                      {
                                                        rhf: "Input",
                                                        name: "standard",
                                                        label: "Standard",
                                                        labelClassName:
                                                          "font-bold",
                                                        props: {
                                                          className:
                                                            "w-[200px]",
                                                          placeholder:
                                                            "enter amount",
                                                          icon: "$",
                                                        },
                                                        rules: {
                                                          pattern: {
                                                            value:
                                                              /^\d*(?:\.\d{1,2})?$/,
                                                            message:
                                                              "Must be a positive number, maximum of two decimals, no commas. e.g. 1234.56",
                                                          },
                                                          required:
                                                            "* Required",
                                                        },
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                              {
                                                slots: [
                                                  {
                                                    rhf: "Checkbox",
                                                    name: "is-increment-amount",
                                                    props: {
                                                      options: [
                                                        {
                                                          label:
                                                            "There is an additional incremental amount.",
                                                          optionlabelClassName:
                                                            "font-bold",
                                                          value: "yes",
                                                          form: [
                                                            {
                                                              slots: [
                                                                {
                                                                  rhf: "Input",
                                                                  label:
                                                                    "Incremental amount",
                                                                  labelClassName:
                                                                    "font-bold",
                                                                  name: "increment-amount",
                                                                  props: {
                                                                    icon: "$",
                                                                  },
                                                                  rules: {
                                                                    pattern: {
                                                                      value:
                                                                        /^\d*(?:\.\d{1,2})?$/,
                                                                      message:
                                                                        "Must be all numbers, no commas. e.g. 1234.56",
                                                                    },
                                                                    required:
                                                                      "* Required",
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
                                            label: "Standard varies by region",
                                            value: "region_standard",
                                            form: [
                                              {
                                                slots: [
                                                  {
                                                    rhf: "FieldGroup",
                                                    name: "income-def-specific-statewide-group-region",
                                                    props: {
                                                      appendText: "Add Region",
                                                      removeText:
                                                        "Remove Region",
                                                    },
                                                    fields: [
                                                      {
                                                        rhf: "Input",
                                                        name: "name-of-region",
                                                        label: "Region name",
                                                        labelClassName:
                                                          "font-bold",
                                                        rules: {
                                                          required:
                                                            "* Required",
                                                          pattern: {
                                                            value:
                                                              /^\S(.*\S)?$/,
                                                            message:
                                                              "Must not have leading or trailing whitespace.",
                                                          },
                                                        },
                                                      },
                                                      {
                                                        rhf: "Textarea",
                                                        name: "region-descript",
                                                        label: "Describe",
                                                        labelClassName:
                                                          "font-bold",
                                                        rules: {
                                                          required:
                                                            "* Required",
                                                          pattern: {
                                                            value:
                                                              /^\S(.*\S)?$/,
                                                            message:
                                                              "Must not have leading or trailing whitespace.",
                                                          },
                                                        },
                                                      },
                                                      {
                                                        rhf: "FieldArray",
                                                        name: "add-house-size",
                                                        props: {
                                                          appendText:
                                                            "Add household size",
                                                        },
                                                        fields: [
                                                          {
                                                            rhf: "Input",
                                                            label:
                                                              "Household size",
                                                            labelClassName:
                                                              "font-bold",
                                                            name: "house-size",
                                                            props: {
                                                              placeholder:
                                                                "enter size",
                                                              className:
                                                                "w-[300px]",
                                                            },
                                                            rules: {
                                                              pattern: {
                                                                value:
                                                                  /^[0-9]\d*$/,
                                                                message:
                                                                  "Must be a positive integer value",
                                                              },
                                                              required:
                                                                "* Required",
                                                            },
                                                          },
                                                          {
                                                            rhf: "Input",
                                                            name: "standard",
                                                            label: "Standard",
                                                            labelClassName:
                                                              "font-bold",
                                                            props: {
                                                              className:
                                                                "w-[200px]",
                                                              placeholder:
                                                                "enter amount",
                                                              icon: "$",
                                                            },
                                                            rules: {
                                                              pattern: {
                                                                value:
                                                                  /^\d*(?:\.\d{1,2})?$/,
                                                                message:
                                                                  "Must be all numbers, no commas. e.g. 1234.56",
                                                              },
                                                              required:
                                                                "* Required",
                                                            },
                                                          },
                                                        ],
                                                      },
                                                      {
                                                        rhf: "Checkbox",
                                                        name: "is-increment-amount",
                                                        props: {
                                                          options: [
                                                            {
                                                              label:
                                                                "There is an additional incremental amount.",
                                                              optionlabelClassName:
                                                                "font-bold",
                                                              value: "yes",
                                                              form: [
                                                                {
                                                                  slots: [
                                                                    {
                                                                      rhf: "Input",
                                                                      label:
                                                                        "Incremental amount",
                                                                      labelClassName:
                                                                        "font-bold",
                                                                      name: "increment-amount",
                                                                      props: {
                                                                        icon: "$",
                                                                      },
                                                                      rules: {
                                                                        pattern:
                                                                          {
                                                                            value:
                                                                              /^\d*(?:\.\d{1,2})?$/,
                                                                            message:
                                                                              "Must be all numbers, no commas. e.g. 1234.56",
                                                                          },
                                                                        required:
                                                                          "* Required",
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
                                            ],
                                          },
                                          {
                                            label:
                                              "Standard varies by living arrangement",
                                            value: "living_standard",

                                            form: [
                                              {
                                                slots: [
                                                  {
                                                    rhf: "FieldGroup",
                                                    name: "liv-arrange",
                                                    props: {
                                                      appendText:
                                                        "Add Living Arrangement",
                                                      removeText:
                                                        "Remove living arrangement",
                                                    },
                                                    fields: [
                                                      {
                                                        rhf: "Input",
                                                        name: "name-of-liv-arrange",
                                                        label:
                                                          "Name of living arrangement",
                                                        labelClassName:
                                                          "font-bold",
                                                        rules: {
                                                          required:
                                                            "* Required",
                                                          pattern: {
                                                            value:
                                                              /^\S(.*\S)?$/,
                                                            message:
                                                              "Must not have leading or trailing whitespace.",
                                                          },
                                                        },
                                                      },
                                                      {
                                                        rhf: "Textarea",
                                                        name: "liv-arrange-descript",
                                                        label: "Describe",
                                                        labelClassName:
                                                          "font-bold",
                                                        rules: {
                                                          required:
                                                            "* Required",
                                                          pattern: {
                                                            value:
                                                              /^\S(.*\S)?$/,
                                                            message:
                                                              "Must not have leading or trailing whitespace.",
                                                          },
                                                        },
                                                      },
                                                      {
                                                        rhf: "FieldArray",
                                                        name: "add-house-size",
                                                        props: {
                                                          appendText:
                                                            "Add household size",
                                                        },
                                                        fields: [
                                                          {
                                                            rhf: "Input",
                                                            label:
                                                              "Household size",
                                                            labelClassName:
                                                              "font-bold",
                                                            name: "house-size",
                                                            props: {
                                                              placeholder:
                                                                "enter size",
                                                              className:
                                                                "w-[300px]",
                                                            },
                                                            rules: {
                                                              pattern: {
                                                                value:
                                                                  /^[0-9]\d*$/,
                                                                message:
                                                                  "Must be a positive integer value",
                                                              },
                                                              required:
                                                                "* Required",
                                                            },
                                                          },
                                                          {
                                                            rhf: "Input",
                                                            name: "standard",
                                                            label: "Standard",
                                                            labelClassName:
                                                              "font-bold",
                                                            props: {
                                                              className:
                                                                "w-[200px]",
                                                              placeholder:
                                                                "enter amount",
                                                              icon: "$",
                                                            },
                                                            rules: {
                                                              pattern: {
                                                                value:
                                                                  /^\d*(?:\.\d{1,2})?$/,
                                                                message:
                                                                  "Must be all numbers, no commas. e.g. 1234.56",
                                                              },
                                                              required:
                                                                "* Required",
                                                            },
                                                          },
                                                        ],
                                                      },
                                                      {
                                                        rhf: "Checkbox",
                                                        name: "is-increment-amount",
                                                        props: {
                                                          options: [
                                                            {
                                                              label:
                                                                "There is an additional incremental amount.",
                                                              optionlabelClassName:
                                                                "font-bold",
                                                              value: "yes",
                                                              form: [
                                                                {
                                                                  slots: [
                                                                    {
                                                                      rhf: "Input",
                                                                      label:
                                                                        "Incremental amount",
                                                                      labelClassName:
                                                                        "font-bold",
                                                                      name: "incremental_amount",
                                                                      props: {
                                                                        icon: "$",
                                                                      },
                                                                      rules: {
                                                                        pattern:
                                                                          {
                                                                            value:
                                                                              /^\d*(?:\.\d{1,2})?$/,
                                                                            message:
                                                                              "Must be all numbers, no commas. e.g. 1234.56",
                                                                          },
                                                                        required:
                                                                          "* Required",
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
                                            ],
                                          },
                                          {
                                            label:
                                              "Standard varies in some other way",
                                            value: "other_standard",

                                            form: [
                                              {
                                                slots: [
                                                  {
                                                    rhf: "FieldGroup",
                                                    name: "add-some-other-way",
                                                    props: {
                                                      appendText:
                                                        "Add other way",
                                                      removeText:
                                                        "Remove other way",
                                                    },
                                                    fields: [
                                                      {
                                                        rhf: "Input",
                                                        name: "name-of-group",
                                                        label: "Name",
                                                        labelClassName:
                                                          "font-bold",
                                                        rules: {
                                                          required:
                                                            "* Required",
                                                          pattern: {
                                                            value:
                                                              /^\S(.*\S)?$/,
                                                            message:
                                                              "Must not have leading or trailing whitespace.",
                                                          },
                                                        },
                                                      },
                                                      {
                                                        rhf: "Textarea",
                                                        name: "group-descript",
                                                        label: "Describe",
                                                        labelClassName:
                                                          "font-bold",
                                                        rules: {
                                                          required:
                                                            "* Required",
                                                          pattern: {
                                                            value:
                                                              /^\S(.*\S)?$/,
                                                            message:
                                                              "Must not have leading or trailing whitespace.",
                                                          },
                                                        },
                                                      },
                                                      {
                                                        rhf: "FieldArray",
                                                        name: "add-house-size",
                                                        props: {
                                                          appendText:
                                                            "Add household size",
                                                        },
                                                        fields: [
                                                          {
                                                            rhf: "Input",
                                                            label:
                                                              "Household size",
                                                            labelClassName:
                                                              "font-bold",
                                                            name: "house-size",
                                                            props: {
                                                              placeholder:
                                                                "enter size",
                                                              className:
                                                                "w-[300px]",
                                                            },
                                                            rules: {
                                                              pattern: {
                                                                value:
                                                                  /^[0-9]\d*$/,
                                                                message:
                                                                  "Must be a positive integer value",
                                                              },
                                                              required:
                                                                "* Required",
                                                            },
                                                          },
                                                          {
                                                            rhf: "Input",
                                                            name: "standard",
                                                            label: "Standard",
                                                            labelClassName:
                                                              "font-bold",
                                                            props: {
                                                              className:
                                                                "w-[200px]",
                                                              placeholder:
                                                                "enter amount",
                                                              icon: "$",
                                                            },
                                                            rules: {
                                                              pattern: {
                                                                value:
                                                                  /^\d*(?:\.\d{1,2})?$/,
                                                                message:
                                                                  "Must be all numbers, no commas. e.g. 1234.56",
                                                              },
                                                              required:
                                                                "* Required",
                                                            },
                                                          },
                                                        ],
                                                      },
                                                      {
                                                        rhf: "Checkbox",
                                                        name: "is-increment-amount",
                                                        props: {
                                                          options: [
                                                            {
                                                              label:
                                                                "There is an additional incremental amount.",
                                                              optionlabelClassName:
                                                                "font-bold",
                                                              value: "yes",
                                                              form: [
                                                                {
                                                                  slots: [
                                                                    {
                                                                      rhf: "Input",
                                                                      label:
                                                                        "Incremental amount",
                                                                      labelClassName:
                                                                        "font-bold",
                                                                      name: "increment-amount",
                                                                      props: {
                                                                        icon: "$",
                                                                      },
                                                                      rules: {
                                                                        pattern:
                                                                          {
                                                                            value:
                                                                              /^\d*(?:\.\d{1,2})?$/,
                                                                            message:
                                                                              "Must be all numbers, no commas. e.g. 1234.56",
                                                                          },
                                                                        required:
                                                                          "* Required",
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
                                            ],
                                          },
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
                    value: "health",
                    label:
                      "Disease, condition, diagnosis, or disorder (check all that apply)",
                    slots: [
                      {
                        rhf: "Checkbox",
                        name: "health-conditions",
                        rules: {
                          required: "* Required",
                        },
                        props: {
                          options: [
                            {
                              label: "Physical disability",
                              value: "physical_disability",
                            },
                            {
                              label: "Brain Injury",
                              value: "brain_injury",
                            },
                            {
                              label: "HIV/AIDS",
                              value: "hiv_aids",
                            },
                            {
                              label: "Medically frail",
                              value: "med_frail",
                            },
                            {
                              label: "Technology dependent",
                              value: "technology_dependent",
                            },
                            { label: "Autism", value: "autism" },
                            {
                              label: "Developmental disability",
                              value: "dev_disability",
                            },
                            {
                              label: "Intellectual disability",
                              value: "int_disability",
                            },
                            {
                              label: "Mental illness",
                              value: "mental_illness",
                            },
                            {
                              label: "Substance use disorder",
                              value: "substance_use_dis",
                            },
                            { label: "Diabetes", value: "diabetes" },
                            { label: "Heart disease", value: "heart_dis" },
                            { label: "Asthma", value: "asthma" },
                            { label: "Obesity", value: "obesity" },
                            {
                              label:
                                "Other disease, condition, diagnosis, or disorder",
                              value: "other",
                              slots: [
                                {
                                  rhf: "Textarea",
                                  name: "other_descript",
                                  label: "Describe",
                                  labelClassName: "font-bold",
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
                      },
                    ],
                  },
                  {
                    label: "Other targeting criteria",
                    value: "other_targeting_criteria",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "other_target_criteria_descript",
                        label: "Describe",
                        labelClassName: "font-bold",
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
            },
          ],
        },
      ],
    },
    {
      title: "Geographic Area",
      sectionId: "geo-area",
      form: [
        {
          description:
            "Will this benefit package be available to the entire state/territory?",
          slots: [
            {
              rhf: "Select",
              name: "is_geo_area",
              props: {
                className: "w-[150px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              rules: {
                required: "* Required",
              },
            },
          ],
        },
        {
          description: "Method of geographic variation",
          dependency: {
            conditions: [
              {
                name: "abp1_geo-area_is_geo_area",
                type: "expectedValue",
                expectedValue: "no",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "Radio",
              name: "geo-variation",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label: "By county",
                    value: "by_county",
                    form: [
                      {
                        description: "Specify counties",
                        slots: [
                          {
                            name: "specify-counties",
                            rhf: "Textarea",
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
                    label: "By region",
                    value: "by_region",
                    form: [
                      {
                        description: "Specify regions",
                        slots: [
                          {
                            name: "specify-regions",
                            rhf: "Textarea",
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
                    label: "By city or town",
                    value: "by_city_town",
                    form: [
                      {
                        description: "Specify cities or towns",
                        slots: [
                          {
                            name: "specific-cities-towns",
                            rhf: "Textarea",
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
                    label: "Other geographic area",
                    value: "other",
                    form: [
                      {
                        description: "Specify other geographic area",
                        slots: [
                          {
                            name: "specify-other",
                            rhf: "Textarea",
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
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Additional information",
      sectionId: "additional-info",
      form: [
        {
          description:
            "Any other information the state/territory wishes to provide about the population (optional)",
          slots: [
            {
              name: "description",
              rhf: "Textarea",
              rules: {
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
  ],
};
