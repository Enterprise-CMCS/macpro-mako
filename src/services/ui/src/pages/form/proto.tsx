import { Document } from "@/components/RHF/RHFInput";

export const ABP1: Document = {
  header: "ABP1: Alternative Benefit Plan",
  sections: [
    {
      title: "Population identification",
      form: [
        {
          description:
            "identifiy and define the population that will participate",
          slots: [
            {
              rhf: "Input",
              name: "alt_benefit_plan_population_name",
              label: "Alternative Benefit Plan population name",
              placeholder: "enter name",
              dependency: {
                // example of a value changing field, with multi-conditions
                conditions: [
                  {
                    name: "geographic_variation",
                    type: "expectedValue",
                    expectedValue: "by_region",
                  },
                  {
                    name: "is_geographic_area",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "setValue", newValue: "Ben" },
              },
            },
          ],
        },
        {
          description:
            "Identify eligibility groups that are included in the Alternative Benefit Plan's population, and which may contain individuals that meet any targeting criteria used to further define the population.",
          slots: [
            {
              rhf: "FieldArray",
              name: "eligibility_groups",
              fields: [
                {
                  rhf: "Select",
                  placeholder: "enter name",
                  className: "w-[300px]",
                  label: "Eligibility group",
                  name: "eligibility_group",
                  options: [
                    {
                      label: "Extended medicaid due to earnings",
                      value: "option1",
                    },
                    {
                      label: "Extended medicaid due to bling",
                      value: "option2",
                    },
                    {
                      label: "Extended medicaid due to bankrupcy",
                      value: "option3",
                    },
                  ],
                },
                {
                  rhf: "Select",
                  name: "mandatory_voluntary",
                  className: "w-[200px]",
                  label: "Mandatory or voluntary",
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
              ],
            },
          ],
        },
        {
          description:
            "Is enrollment available for all individuals in these eligibility groups?",
          dependency: {
            //example of a conditionally revealed field
            conditions: [
              {
                name: "alt_benefit_plan_population_name",
                type: "valueExists",
              },
            ],
            effect: { type: "show" },
          },
          slots: [
            {
              rhf: "Select",
              label: "Alternative Benefit Plan population name",
              name: "is_enrollment_available",
              className: "w-[150px]",
              placeholder: "Select",
              options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Targeting criteria",
      dependency: {
        // example of conditionally hidden section
        conditions: [
          {
            name: "alt_benefit_plan_population_name",
            type: "expectedValue",
            expectedValue: "hide",
          },
        ],
        effect: { type: "hide" },
      },
      form: [
        {
          description: "Targeting criteria (select all that apply):",
          slots: [
            {
              rhf: "Checkbox",
              name: "target_criteria",
              label: "Mandatory or voluntary",
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
                      ],
                    },
                    {
                      description: "Income standard definition",
                      slots: [
                        {
                          rhf: "Radio",
                          name: "income_definition",
                          options: [
                            {
                              label: "A percentage",
                              value: "income_definition_percentage",
                            },
                            {
                              label: "A specific amount",
                              value: "income_definition_specific",
                              slots: [
                                {
                                  rhf: "Radio",
                                  name: "income_definition_specific",
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
                                                  placeholder: "enter size",
                                                  className: "w-[300px]",
                                                  label: "Household Size",
                                                  name: "household_size",
                                                },
                                                {
                                                  rhf: "Input",
                                                  name: "standard",
                                                  className: "w-[200px]",
                                                  placenholder: "enter amount",
                                                  label: "Standard ($)",
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        {
                                          description:
                                            "Is there an additional incremental amount",
                                          slots: [
                                            {
                                              rhf: "Switch",
                                              name: "is_incremental_amount",
                                            },
                                          ],
                                        },
                                        {
                                          description:
                                            "Enter incremental dollar amount",
                                          slots: [
                                            {
                                              rhf: "Input",
                                              name: "doller_incremental_amount",
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      label: "Standard Varies by region",
                                      value: "region_standard",
                                    },
                                    {
                                      label:
                                        "standard varies by living arrangement",
                                      value: "living_standard",
                                    },
                                    {
                                      label:
                                        "standard varies by some other way",
                                      value: "other_standard",
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
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
                      name: "health_conditions",
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
                          label: "HIV / AIDS",
                          value: "hiv_aids",
                        },
                        {
                          label: "Medically frail",
                          value: "ben",
                        },
                        {
                          label: "Technology dependent",
                          value: "technology_dependent",
                        },
                        {
                          label: "Other",
                          value: "other",
                          slots: [
                            {
                              rhf: "Input",
                              name: "other_description",
                              label: "Describe",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  label: "Other targeting criteria",
                  value: "other_targeting_criteria",
                  slots: [
                    {
                      rhf: "Input",
                      name: "other_targeting_criteria_description",
                      label: "Describe",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Geographic Area",
      form: [
        {
          description:
            "Will the Alternative Benefit Plan population include individuals from the entire state or territory?",
          slots: [
            {
              rhf: "Select",
              className: "w-[150px]",
              name: "is_geographic_area",
              options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
          ],
        },
        {
          description: "Select a method of geographic variation",
          slots: [
            {
              rhf: "Radio",
              name: "geographic_variation",
              options: [
                { label: "By country", value: "by_country" },
                { label: "By region", value: "by_region" },
                { label: "By city or town", value: "by_city_town" },
                { label: "Other geographic area", value: "other" },
              ],
            },
          ],
        },
        {
          description: "Specify Countries",
          slots: [
            {
              name: "specify_countries",
              rhf: "Input",
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
            "Other Information Related to Selection of the Section 1937 Coverage Option and the Base Benchmark Plan (optional):",
          slots: [
            {
              name: "additional_information",
              rhf: "Textarea",
            },
          ],
        },
      ],
    },
    {
      title: "Testing Alt Layouts",
      form: [
        {
          description: "A test of horizontal layouts with no slot styles",
          wrapperStyling: "flex flex-wrap gap-2",
          slots: [
            {
              name: "example1_1",
              label: "Example 1.1",
              rhf: "Input",
            },
            {
              name: "example1_2",
              label: "Example 1.2",
              rhf: "Input",
            },
            {
              name: "example1_3",
              label: "Example 1.3",
              rhf: "Input",
            },
          ],
        },
        {
          description: "A test of horizontal layouts with slot styles",
          wrapperStyling: "flex flex-wrap gap-2",
          slots: [
            {
              name: "example2_1",
              label: "Example 2.1",
              className: "w-80",
              rhf: "Input",
            },
            {
              name: "example2_2",
              label: "Example 2.2",
              className: "w-30",
              rhf: "Input",
            },
            {
              name: "example2_3",
              label: "Example 2.3",
              className: "w-120",
              rhf: "Input",
            },
          ],
        },
      ],
    },
  ],
};
