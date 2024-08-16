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
              props: {
                className: "w-[355px]",
              },
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
                    className: "w-[229px]",
                    options: [
                      {
                        label: "Adult",
                        value: "adult",
                      },
                      {
                        label:
                          "Aged, blind, and disabled individuals in 209(b) states",
                        value: "aged_blind_disabled_individuals_209b_states",
                      },
                      {
                        label:
                          "Aged, blind, or disabled individuals eligible for but not receiving cash",
                        value:
                          "aged_blind_disabled_eligible_but_not_receiving_cash",
                      },
                      {
                        label: "Blind or disabled individuals eligible in 1937",
                        value: "blind_disabled_eligible_1973",
                      },
                      {
                        label:
                          "Certain individuals needing treatment for breast or cervical cancer",
                        value:
                          "individuals_need_treatment_for_breasts_cervical_cancer",
                      },
                      {
                        label: "Children with non-IV-E adoption assistance",
                        value: "children_non-IV-E_adoption_assistance",
                      },
                      {
                        label:
                          "Children with Title IV-E adoption assistance, foster care, or guardianship care",
                        value:
                          "children_title_IV-E_adoption_assist_foster_guardianship_care",
                      },
                      {
                        label: "Deemed newborns",
                        value: "deemed_newborns",
                      },
                      {
                        label: "Disabled adult children",
                        value: "disabled_adult_children",
                      },
                      {
                        label:
                          "Disabled widows and widowers ineligible for SSI due to early receipt of Social Security",
                        value:
                          "disabled_widows_ineligible_SSI_due_to_early_receipt_social_security",
                      },
                      {
                        label:
                          "Disabled widows and widowers ineligible for SSI due to increase in OASDI",
                        value:
                          "disabled_widows_ineligible_SSI_due_to_increase_OASDI",
                      },
                      {
                        label:
                          "Extended Medicaid due to spousal support collections",
                        value: "extend_medicaid_spousal_support_collect",
                      },
                      {
                        label:
                          "Family Opportunity Act children with disabilities",
                        value: "family_opportunity_act_children_disabilities",
                      },
                      {
                        label: "Former foster care children",
                        value: "former_foster_children",
                      },
                      {
                        label: "Independent foster care adolescents",
                        value: "independent_foster_care_adolescents",
                      },
                      {
                        label:
                          "Individuals eligible for cash except for institutionalization",
                        value: "eligible_cash_except_for_institutionalization",
                      },
                      {
                        label:
                          "Individuals eligible for SSI/SSP but for OASDI COLA increases since April 1977",
                        value:
                          "eligible_SSI_SSP_but_for_OASDI_COLA_increases_April_1977",
                      },
                      {
                        label:
                          "Individuals receiving home and community-based services under institutional rules",
                        value:
                          "receiving_home_community_services_under_inst_rule",
                      },
                      {
                        label: "Individuals receiving hospice care",
                        value: "hospice_care",
                      },
                      {
                        label:
                          "Individuals receiving mandatory state supplements",
                        value:
                          "individuals_receiving_mandatory_state_supplements",
                      },
                      {
                        label: "Individuals who are essential spouses",
                        value: "essential_spouses",
                      },
                      {
                        label:
                          "Individuals who lost eligibility for SSI/SSP due to an increase in OASDI benefits in 1972",
                        value:
                          "lost_eligibility_SSI_SSP_increase_in_OASDI_benefits_1972",
                      },
                      {
                        label: "Individuals with tuberculosis",
                        value: "tuberculosis",
                      },
                      {
                        label: "Infants and children under age 19",
                        value: "infants_children_under_19",
                      },
                      {
                        label:
                          "Institutionalized individuals continuously eligible since 1973",
                        value: "institutionalized_eligible_1973",
                      },
                      {
                        label:
                          "Institutionalized individuals eligible under a special income level",
                        value: "inst_eligible_under_special_income_level",
                      },
                      {
                        label: "Medically needy aged, blind, or disabled",
                        value: "med_needy_aged_blind_disabled",
                      },
                      {
                        label:
                          "Medically needy blind or disabled individuals eligible in 1973",
                        value:
                          "med_needy_aged_blind_disabled_individuals_eligible_in_1973",
                      },
                      {
                        label: "Medically needy children age 18 through 20",
                        value: "med_needy_age_18_through_20",
                      },
                      {
                        label: "Medically needy children under age 18",
                        value: "med_needy_children_under_18",
                      },
                      {
                        label: "Medically needy parents and other caretakers",
                        value: "med_needy_parents_caretakers",
                      },
                      {
                        label: "Medically needy pregnant women",
                        value: "med_needy_pregnant_women",
                      },
                      {
                        label:
                          "Optional coverage of parents and other caretaker relatives",
                        value: "opt_coverage_parents_other_caretaker_relatives",
                      },
                      {
                        label:
                          "Optional state supplement - 1634 states and SSI criteria states with 1616 agreements",
                        value:
                          "opt_state_supp_1634_states_SSI_criteria_states_1616_agreements",
                      },
                      {
                        label:
                          "Optional state supplement - 209(b) states and SSI criteria states without 1616 agreements",
                        value:
                          "opt_state_supp_209b_states_SSI_criteria_states_without_1616_agreements",
                      },
                      {
                        label: "Optional targeted low-income children",
                        value: "opt_targ_low_income_children",
                      },
                      {
                        label: "Parents and other caretaker relatives",
                        value: "parents_caretaker_relatives",
                      },
                      {
                        label: "Poverty-level aged or disabled",
                        value: "poverty_level_aged_or_disabled",
                      },
                      {
                        label: "Pregnant women",
                        value: "pregnant_women",
                      },
                      {
                        label: "Qualified disabled children under age 19",
                        value: "qualified_disabled_children_under_19",
                      },
                      {
                        label:
                          "Reasonable classifications of individuals under age 21",
                        value: "reasonable_class_under_21",
                      },
                      {
                        label: "SSI beneficiaries",
                        value: "ssi_beneficiaries",
                      },
                      {
                        label: "Ticket to Work basic",
                        value: "ticket_work_basic",
                      },
                      {
                        label: "Ticket to Work medical improvements",
                        value: "ticket_work_medical_imp_group",
                      },
                      {
                        label: "Transitional medical assistance",
                        value: "transitional_medical_assist",
                      },
                      {
                        label: "Work incentives",
                        value: "work_incentives",
                      },
                      {
                        label: "Working disabled under 1619(b)",
                        value: "working_disabled_under_1619b",
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
                    className: "w-[229px]",
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
                                                  iconRight: true,
                                                  className: "w-[229px]",
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
                                                  iconRight: true,
                                                  className: "w-[229px]",
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
                                                  iconRight: true,
                                                  className: "w-[229px]",
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
                                                        "Add standard",
                                                    },
                                                    fields: [
                                                      {
                                                        rhf: "Input",
                                                        label: "Household size",
                                                        name: "house-size",
                                                        labelClassName:
                                                          "font-bold",
                                                        props: {
                                                          className:
                                                            "w-[150px]",
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
                                                  {
                                                    rhf: "Radio",
                                                    name: "is-increment-amount",
                                                    label:
                                                      "Is there an additional incremental amount?",
                                                    labelClassName:
                                                      "font-bold mt-3",
                                                    horizontalLayout: true,

                                                    props: {
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
                                                    rhf: "Input",
                                                    label: "Incremental amount",
                                                    name: "increment-amount",
                                                    labelClassName: "font-bold",
                                                    props: {
                                                      icon: "$",
                                                      className: "w-[200px]",
                                                    },
                                                    dependency: {
                                                      conditions: [
                                                        {
                                                          name: "abp1_target-criteria_is-increment-amount",
                                                          type: "expectedValue",
                                                          expectedValue: "yes",
                                                        },
                                                      ],
                                                      effect: {
                                                        type: "show",
                                                      },
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
                                                      appendText: "Add region",
                                                      removeText:
                                                        "Remove region",
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
                                                              className:
                                                                "w-[150px]",
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
                                                        rhf: "Radio",
                                                        name: "is-increment-amount",
                                                        label:
                                                          "Is there an additional incremental amount?",
                                                        labelClassName:
                                                          "font-bold mt-3",
                                                        horizontalLayout: true,

                                                        props: {
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
                                                        rhf: "Input",
                                                        label:
                                                          "Incremental amount",
                                                        name: "increment-amount",
                                                        labelClassName:
                                                          "font-bold",
                                                        props: {
                                                          icon: "$",
                                                          className:
                                                            "w-[200px]",
                                                        },
                                                        dependency: {
                                                          conditions: [
                                                            {
                                                              name: "is-increment-amount",
                                                              type: "expectedValue",
                                                              expectedValue:
                                                                "yes",
                                                            },
                                                          ],
                                                          effect: {
                                                            type: "show",
                                                          },
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
                                                        "Add living arrangement",
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
                                                              className:
                                                                "w-[150px]",
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
                                                        rhf: "Radio",
                                                        name: "is-increment-amount",
                                                        label:
                                                          "Is there an additional incremental amount?",
                                                        labelClassName:
                                                          "font-bold mt-3",
                                                        horizontalLayout: true,

                                                        props: {
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
                                                        rhf: "Input",
                                                        label:
                                                          "Incremental amount",
                                                        name: "increment-amount",
                                                        labelClassName:
                                                          "font-bold",
                                                        props: {
                                                          icon: "$",
                                                          className:
                                                            "w-[200px]",
                                                        },
                                                        dependency: {
                                                          conditions: [
                                                            {
                                                              name: "is-increment-amount",
                                                              type: "expectedValue",
                                                              expectedValue:
                                                                "yes",
                                                            },
                                                          ],
                                                          effect: {
                                                            type: "show",
                                                          },
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
                                          {
                                            label:
                                              "Standard varies in some other way",
                                            value: "other_standard",

                                            form: [
                                              {
                                                slots: [
                                                  {
                                                    rhf: "FieldGroup",
                                                    name: "add-other-way",
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
                                                            name: "house-size",
                                                            labelClassName:
                                                              "font-bold",
                                                            props: {
                                                              className:
                                                                "w-[150px]",
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
                                                        rhf: "Radio",
                                                        name: "is-increment-amount",
                                                        label:
                                                          "Is there an additional incremental amount?",
                                                        labelClassName:
                                                          "font-bold mt-3",
                                                        horizontalLayout: true,

                                                        props: {
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
                                                        rhf: "Input",
                                                        label:
                                                          "Incremental amount",
                                                        name: "increment-amount",
                                                        labelClassName:
                                                          "font-bold",
                                                        props: {
                                                          icon: "$",
                                                          className:
                                                            "w-[200px]",
                                                        },
                                                        dependency: {
                                                          conditions: [
                                                            {
                                                              name: "is-increment-amount",
                                                              type: "expectedValue",
                                                              expectedValue:
                                                                "yes",
                                                            },
                                                          ],
                                                          effect: {
                                                            type: "show",
                                                          },
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
                    label: "Disease, condition, diagnosis, or disorder",
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
      title: "Geographic area",
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
          description: "Other information about the population (optional)",
          slots: [
            {
              name: "description",
              rhf: "Textarea",
              props: {
                className: "min-h-[114px]",
              },
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
