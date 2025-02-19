import { DefaultFieldGroupProps, FormSchema } from "shared-types";
import { noLeadingTrailingWhitespace } from "shared-utils/regex";

export const v202401: FormSchema = {
  header: "ABP 1: Alternative Benefit Plan populations",
  formId: "abp1",
  sections: [
    {
      title: "Population identification",
      sectionId: "pop_id",
      form: [
        {
          description:
            "Identify and define the population that will participate in the Alternative Benefit Plan.",
          slots: [
            {
              rhf: "Input",
              name: "alt_benefit_plan_population_name",
              label: "Alternative Benefit Plan population name",
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              props: { placeholder: "enter name" },
            },
          ],
        },
        {
          description:
            "Identify eligibility groups that are included in the Alternative Benefit Plan's population and that may contain individuals that meet any targeting criteria used to further define the population.",
          slots: [
            {
              rhf: "FieldArray",
              name: "eligibility_groups",
              props: {
                appendText: "Add group",
              },
              fields: [
                {
                  rhf: "Select",
                  name: "eligibility_group",
                  rules: {
                    required: "* Required",
                  },
                  label: "Eligibility group",
                  props: {
                    className: "min-w-[300px]",
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
                        label: "Extended Medicaid Due to Earnings",
                        value: "extend_medicaid_earnings",
                      },
                      {
                        label: "Extended Medicaid Due to Spousal Support Collections",
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
                        value: "children_title_IV-E_adoption_assist_foster_guardianship_care",
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
                        label: "Aged, Blind and Disabled Individuals in 209(b) States",
                        value: "aged_blind_disabled_individuals_209b_states",
                      },
                      {
                        label: "Individuals Receiving Mandatory State Supplements",
                        value: "individuals_receiving_mandatory_state_supplements",
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
                        value: "lost_eligibility_SSI_SSP_increase_in_OASDI_benefits_1972",
                      },
                      {
                        label:
                          "Individuals Eligible for SSI/SSP but for OASDI COLA increases since April, 1977",
                        value: "eligible_SSI_SSP_but_for_OASDI_COLA_increases_April_1977",
                      },
                      {
                        label:
                          "Disabled Widows and Widowers Ineligible for SSI due to Increase in OASDI",
                        value: "disabled_widows_ineligible_SSI_due_to_increase_OASDI",
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
                        label: "Qualified Medicare Beneficiaries",
                        value: "qualified_medicare_beneficiaries",
                      },
                      {
                        label: "Qualified Disabled and Working Individuals",
                        value: "qualified_disabled_working_individuals",
                      },
                      {
                        label: "Specified Low Income Medicare Beneficiaries",
                        value: "spec_low_income_medicare_beneficiaries",
                      },
                      {
                        label: "Qualifying Individuals",
                        value: "qualifying_individuals",
                      },
                      {
                        label: "Optional Coverage of Parents and Other Caretaker Relatives",
                        value: "opt_coverage_parents_other_caretaker_relatives",
                      },
                      {
                        label: "Reasonable Classifications of Individuals under Age 21",
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
                        label: "Individuals Electing COBRA Continuation Coverage",
                        value: "individuals_electing_COBRA_cont_converage",
                      },
                      {
                        label:
                          "Certain Individuals Needing Treatment for Breast or Cervical Cancer",
                        value: "individuals_need_treatment_for_breasts_cervical_cancer",
                      },
                      {
                        label: "Individuals with Tuberculosis",
                        value: "tuberculosis",
                      },
                      {
                        label:
                          "Aged, Blind or Disabled Individuals Eligible for but Not Receiving Cash",
                        value: "aged_blind_disabled_eligible_but_not_receiving_cash",
                      },
                      {
                        label: "Individuals Eligible for Cash except for Institutionalization",
                        value: "eligible_cash_except_for_institutionalization",
                      },
                      {
                        label:
                          "Individuals Receiving Home and Community Based Services under Institutional Rules",
                        value: "receiving_home_community_services_under_inst_rule",
                      },
                      {
                        label:
                          "Optional State Supplement - 1634 States and SSI Criteria States with 1616 Agreements",
                        value: "opt_state_supp_1634_states_SSI_criteria_states_1616_agreements",
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
                        label: "Family Opportunity Act Children with Disabilities",
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
                        label: "Medically Needy Blind or Disabled Individuals Eligible in 1973",
                        value: "med_needy_blind_disabled_eligible_1973",
                      },
                    ],
                  },
                },
                {
                  rhf: "Select",
                  name: "mandatory_voluntary",
                  label: "Mandatory or Voluntary",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    className: "w-[200px]",
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
          description: "Is enrollment available for all individuals in these eligibility groups?",
          slots: [
            {
              rhf: "Select",
              name: "is_enrollment_available",
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
      sectionId: "sec-id",
      dependency: {
        // example of conditionally hidden section
        conditions: [
          {
            name: "abp1_pop-id_is_enrollment_available",
            type: "expectedValue",
            expectedValue: "no",
          },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          description: "Targeting criteria (check all that apply)",
          slots: [
            {
              rhf: "Checkbox",
              name: "target_criteria",
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
                            name: "income_target",
                            rules: {
                              required: "* Required",
                            },
                            props: {
                              options: [
                                {
                                  label: "Households with income at or below the standard",
                                  value: "income_target_below",
                                },
                                {
                                  label: "Households with income above the standard",
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
                            name: "income_definition",
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
                                      name: "income_definition_percentage",
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
                                                    message: "Must be a positive percentage",
                                                  },
                                                  required: "* Required",
                                                },
                                                name: "federal_poverty_level_percentage",
                                                label: "Enter the federal poverty level percentage",
                                              },
                                            ],
                                          },
                                          {
                                            label: "SSI federal benefit amount",
                                            value: "ssi_federal_benefit_amount",
                                            slots: [
                                              {
                                                rhf: "Input",
                                                name: "ssi_federal_benefit_percentage",
                                                label:
                                                  "Enter the SSI Federal Benefit Rate percentage",
                                                props: {
                                                  icon: "%",
                                                },
                                                rules: {
                                                  pattern: {
                                                    value: /^\d*\.?\d+$/,
                                                    message: "Must be a positive percentage",
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
                                                name: "other_percentage",
                                                label: "Enter the other percentage",
                                                props: {
                                                  icon: "%",
                                                },
                                                rules: {
                                                  pattern: {
                                                    value: /^\d*\.?\d+$/,
                                                    message: "Must be a positive percentage",
                                                  },
                                                  required: "* Required",
                                                },
                                              },
                                              {
                                                rhf: "Textarea",
                                                name: "other_describe",
                                                label: "Describe:",
                                                rules: {
                                                  required: "* Required",
                                                  pattern: {
                                                    value: noLeadingTrailingWhitespace,
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
                                      name: "income_definition_specific",
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
                                                    name: "income_definition_specific_statewide",
                                                    fields: [
                                                      {
                                                        rhf: "Input",
                                                        label: "Household Size",
                                                        name: "household_size",
                                                        props: {
                                                          placeholder: "enter size",
                                                          className: "w-[300px]",
                                                        },
                                                        rules: {
                                                          pattern: {
                                                            value: /^[0-9]\d*$/,
                                                            message:
                                                              "Must be a positive integer value",
                                                          },
                                                          required: "* Required",
                                                        },
                                                      },
                                                      {
                                                        rhf: "Input",
                                                        name: "standard",
                                                        label: "Standard ($)",
                                                        props: {
                                                          className: "w-[200px]",
                                                          placeholder: "enter amount",
                                                          icon: "$",
                                                        },
                                                        rules: {
                                                          pattern: {
                                                            value: /^\d*(?:\.\d{1,2})?$/,
                                                            message:
                                                              "Must be a positive number, maximum of two decimals, no commas. e.g. 1234.56",
                                                          },
                                                          required: "* Required",
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
                                                    name: "is_incremental_amount_statewide_std",
                                                    props: {
                                                      options: [
                                                        {
                                                          label:
                                                            "There is an additional incremental amount.",
                                                          value: "yes",
                                                          form: [
                                                            {
                                                              slots: [
                                                                {
                                                                  rhf: "Input",
                                                                  label: "Incremental amount ($)",
                                                                  name: "dollar_incremental_amount_statewide_std",
                                                                  props: {
                                                                    icon: "$",
                                                                  },
                                                                  rules: {
                                                                    pattern: {
                                                                      value: /^\d*(?:\.\d{1,2})?$/,
                                                                      message:
                                                                        "Must be all numbers, no commas. e.g. 1234.56",
                                                                    },
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
                                            label: "Standard varies by region",
                                            value: "region_standard",
                                            form: [
                                              {
                                                slots: [
                                                  {
                                                    rhf: "FieldArray",
                                                    name: "income_definition_specific_statewide_group_region",
                                                    props: {
                                                      ...DefaultFieldGroupProps,
                                                      appendText: "Add Region",
                                                      removeText: "Remove Region",
                                                    },
                                                    fields: [
                                                      {
                                                        rhf: "Input",
                                                        name: "name_of_region",
                                                        label: "Region Name",
                                                        rules: {
                                                          required: "* Required",
                                                          pattern: {
                                                            value: /^\S(.*\S)?$/,
                                                            message:
                                                              "Must not have leading or trailing whitespace.",
                                                          },
                                                        },
                                                      },
                                                      {
                                                        rhf: "Textarea",
                                                        name: "region_description",
                                                        label: "Description",
                                                        rules: {
                                                          required: "* Required",
                                                          pattern: {
                                                            value: noLeadingTrailingWhitespace,
                                                            message:
                                                              "Must not have leading or trailing whitespace.",
                                                          },
                                                        },
                                                      },
                                                      {
                                                        rhf: "FieldArray",
                                                        name: "income_definition_region_statewide_arr",
                                                        props: {
                                                          appendText: "Add household size",
                                                        },
                                                        fields: [
                                                          {
                                                            rhf: "Input",
                                                            label: "Household Size",
                                                            name: "household_size",
                                                            props: {
                                                              placeholder: "enter size",
                                                              className: "w-[300px]",
                                                            },
                                                            rules: {
                                                              pattern: {
                                                                value: /^[0-9]\d*$/,
                                                                message:
                                                                  "Must be a positive integer value",
                                                              },
                                                              required: "* Required",
                                                            },
                                                          },
                                                          {
                                                            rhf: "Input",
                                                            name: "standard",
                                                            label: "Standard ($)",
                                                            props: {
                                                              className: "w-[200px]",
                                                              placeholder: "enter amount",
                                                              icon: "$",
                                                            },
                                                            rules: {
                                                              pattern: {
                                                                value: /^\d*(?:\.\d{1,2})?$/,
                                                                message:
                                                                  "Must be all numbers, no commas. e.g. 1234.56",
                                                              },
                                                              required: "* Required",
                                                            },
                                                          },
                                                        ],
                                                      },
                                                      {
                                                        rhf: "Checkbox",
                                                        name: "is_incremental_amount",
                                                        props: {
                                                          options: [
                                                            {
                                                              label:
                                                                "There is an additional incremental amount.",
                                                              value: "yes",
                                                              form: [
                                                                {
                                                                  slots: [
                                                                    {
                                                                      rhf: "Input",
                                                                      label:
                                                                        "Incremental amount ($)",
                                                                      name: "dollar_incremental_amount",
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
                                            ],
                                          },
                                          {
                                            label: "Standard varies by living arrangement",
                                            value: "living_standard",

                                            form: [
                                              {
                                                slots: [
                                                  {
                                                    rhf: "FieldArray",
                                                    name: "income_definition_specific_statewide_group_liv_arrange",
                                                    props: {
                                                      ...DefaultFieldGroupProps,
                                                      appendText: "Add Living Arrangement",
                                                      removeText: "Remove living arrangement",
                                                    },
                                                    fields: [
                                                      {
                                                        rhf: "Input",
                                                        name: "name_of_living_arrangement",
                                                        label: "Name of living arrangement",
                                                        rules: {
                                                          required: "* Required",
                                                          pattern: {
                                                            value: /^\S(.*\S)?$/,
                                                            message:
                                                              "Must not have leading or trailing whitespace.",
                                                          },
                                                        },
                                                      },
                                                      {
                                                        rhf: "Textarea",
                                                        name: "living_arrangement_description",
                                                        label: "Description",
                                                        rules: {
                                                          required: "* Required",
                                                          pattern: {
                                                            value: noLeadingTrailingWhitespace,
                                                            message:
                                                              "Must not have leading or trailing whitespace.",
                                                          },
                                                        },
                                                      },
                                                      {
                                                        rhf: "FieldArray",
                                                        name: "income_definition_specific_statewide_arr",
                                                        props: {
                                                          appendText: "Add household size",
                                                        },
                                                        fields: [
                                                          {
                                                            rhf: "Input",
                                                            label: "Household Size",
                                                            name: "household_size",
                                                            props: {
                                                              placeholder: "enter size",
                                                              className: "w-[300px]",
                                                            },
                                                            rules: {
                                                              pattern: {
                                                                value: /^[0-9]\d*$/,
                                                                message:
                                                                  "Must be a positive integer value",
                                                              },
                                                              required: "* Required",
                                                            },
                                                          },
                                                          {
                                                            rhf: "Input",
                                                            name: "standard",
                                                            label: "Standard ($)",
                                                            props: {
                                                              className: "w-[200px]",
                                                              placeholder: "enter amount",
                                                              icon: "$",
                                                            },
                                                            rules: {
                                                              pattern: {
                                                                value: /^\d*(?:\.\d{1,2})?$/,
                                                                message:
                                                                  "Must be all numbers, no commas. e.g. 1234.56",
                                                              },
                                                              required: "* Required",
                                                            },
                                                          },
                                                        ],
                                                      },
                                                      {
                                                        rhf: "Checkbox",
                                                        name: "is_incremental_amount",
                                                        props: {
                                                          options: [
                                                            {
                                                              label:
                                                                "There is an additional incremental amount.",
                                                              value: "yes",
                                                              form: [
                                                                {
                                                                  slots: [
                                                                    {
                                                                      rhf: "Input",
                                                                      label:
                                                                        "Incremental amount ($)",
                                                                      name: "dollar_incremental_amount",
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
                                            ],
                                          },
                                          {
                                            label: "Standard varies in some other way",
                                            value: "other_standard",

                                            form: [
                                              {
                                                slots: [
                                                  {
                                                    rhf: "FieldArray",
                                                    name: "income_definition_specific_statewide_group_other",
                                                    props: {
                                                      ...DefaultFieldGroupProps,
                                                      appendText: "Add some other way",
                                                      removeText: "Remove some other way",
                                                    },
                                                    fields: [
                                                      {
                                                        rhf: "Input",
                                                        name: "name_of_group",
                                                        label: "Name",
                                                        rules: {
                                                          required: "* Required",
                                                          pattern: {
                                                            value: /^\S(.*\S)?$/,
                                                            message:
                                                              "Must not have leading or trailing whitespace.",
                                                          },
                                                        },
                                                      },
                                                      {
                                                        rhf: "Textarea",
                                                        name: "group_description",
                                                        label: "Description",
                                                        rules: {
                                                          required: "* Required",
                                                          pattern: {
                                                            value: noLeadingTrailingWhitespace,
                                                            message:
                                                              "Must not have leading or trailing whitespace.",
                                                          },
                                                        },
                                                      },
                                                      {
                                                        rhf: "FieldArray",
                                                        name: "income_definition_specific_statewide_arr",
                                                        props: {
                                                          appendText: "Add household size",
                                                        },
                                                        fields: [
                                                          {
                                                            rhf: "Input",
                                                            label: "Household Size",
                                                            name: "household_size",
                                                            props: {
                                                              placeholder: "enter size",
                                                              className: "w-[300px]",
                                                            },
                                                            rules: {
                                                              pattern: {
                                                                value: /^[0-9]\d*$/,
                                                                message:
                                                                  "Must be a positive integer value",
                                                              },
                                                              required: "* Required",
                                                            },
                                                          },
                                                          {
                                                            rhf: "Input",
                                                            name: "standard",
                                                            label: "Standard ($)",
                                                            props: {
                                                              className: "w-[200px]",
                                                              placeholder: "enter amount",
                                                              icon: "$",
                                                            },
                                                            rules: {
                                                              pattern: {
                                                                value: /^\d*(?:\.\d{1,2})?$/,
                                                                message:
                                                                  "Must be all numbers, no commas. e.g. 1234.56",
                                                              },
                                                              required: "* Required",
                                                            },
                                                          },
                                                        ],
                                                      },
                                                      {
                                                        rhf: "Checkbox",
                                                        name: "is_incremental_amount",
                                                        props: {
                                                          options: [
                                                            {
                                                              label:
                                                                "There is an additional incremental amount.",
                                                              value: "yes",
                                                              form: [
                                                                {
                                                                  slots: [
                                                                    {
                                                                      rhf: "Input",
                                                                      label:
                                                                        "Incremental amount ($)",
                                                                      name: "dollar_incremental_amount",
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
                    label: "Disease, condition, diagnosis, or disorder (check all that apply)",
                    slots: [
                      {
                        rhf: "Checkbox",
                        name: "health_conditions",
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
                              label: "Other disease, condition, diagnosis, or disorder",
                              value: "other",
                              slots: [
                                {
                                  rhf: "Textarea",
                                  name: "other_description",
                                  label: "Describe",
                                  rules: {
                                    required: "* Required",
                                    pattern: {
                                      value: noLeadingTrailingWhitespace,
                                      message: "Must not have leading or trailing whitespace.",
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
                        name: "other_targeting_criteria_description",
                        label: "Describe",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message: "Must not have leading or trailing whitespace.",
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
            "Will the Alternative Benefit Plan population include individuals from the entire state/territory?",
          slots: [
            {
              rhf: "Select",
              name: "is_geographic_area",
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
                name: "abp1_geo-area_is_geographic_area",
                type: "expectedValue",
                expectedValue: "no",
              },
            ],
            effect: { type: "show" },
          },
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
                    label: "By county",
                    value: "by_county",
                    form: [
                      {
                        description: "Specify counties",
                        slots: [
                          {
                            name: "specify_counties",
                            rhf: "Textarea",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message: "Must not have leading or trailing whitespace.",
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
                            name: "specify_regions",
                            rhf: "Textarea",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message: "Must not have leading or trailing whitespace.",
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
                            name: "specify_cities_towns",
                            rhf: "Textarea",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message: "Must not have leading or trailing whitespace.",
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
                            name: "specify_other",
                            rhf: "Textarea",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message: "Must not have leading or trailing whitespace.",
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
      sectionId: "addt-info",
      form: [
        {
          description:
            "Any other information the state/territory wishes to provide about the population (optional)",
          // "Other information related to selection of the Section 1937 coverage option and the base benchmark plan (optional)",
          slots: [
            {
              name: "additional_information",
              rhf: "Textarea",
              rules: {
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
          ],
        },
      ],
    },
    // {
    //   title: "Testing Alt Layouts",
    //   form: [
    //     {
    //       description: "A test of horizontal layouts with no slot styles",
    //       wrapperClassName: "flex flex-wrap gap-6",
    //       slots: [
    //         {
    //           name: "example1_1",
    //           label: "Example 1.1",
    //           rhf: "Input",
    //         },
    //         {
    //           name: "example1_2",
    //           label: "Example 1.2",
    //           rhf: "Input",
    //         },
    //         {
    //           name: "example1_3",
    //           label: "Example 1.3",
    //           rhf: "Input",
    //         },
    //       ],
    //     },
    //     {
    //       description: "A test of horizontal layouts with slot styles",
    //       wrapperClassName: "flex flex-wrap gap-6",
    //       slots: [
    //         {
    //           name: "example2_1",
    //           label: "Example 2.1",
    //           rhf: "Input",
    //           props: {
    //             className: "w-80",
    //           },
    //         },
    //         {
    //           name: "example2_2",
    //           label: "Example 2.2",
    //           rhf: "Input",
    //           props: {
    //             className: "w-30",
    //           },
    //         },
    //         {
    //           name: "example2_3",
    //           label: "Example 2.3",
    //           rhf: "Input",
    //           props: {
    //             className: "w-120",
    //           },
    //         },
    //       ],
    //     },
    //   ],
    // },
  ],
};
