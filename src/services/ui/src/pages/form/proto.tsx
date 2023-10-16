import { Document, RHFSlotProps } from "@/components/RHF/RHFInput";

export const ABP1: Document = {
  header: "ABP1: Alternative Benefit Plan",
  sections: [
    {
      title: "Population identification",
      form: [
        {
          description:
            "identifiy and define the population that will participate",
          slot: {
            name: "alt_benefit_plan_population_name",
            label: "Alternative Benefit Plan population name",
            rhf: "Text",
            props: { placeholder: "" },
          },
        },
        {
          description:
            "Identify Eligibility groups that are included in the Alternative Benefit Plan's population and which may contain individuals that meet any targeting criteria used to further define the ben",
          slot: {
            rhf: "FieldArray",
            name: "eligibility_groups",
            props: {
              fields: [
                {
                  rhf: "Select",
                  className: "w-[300px]",
                  label: "Eligibility group",
                  name: "eligibility_group",
                  props: {
                    placeholder: "enter name",
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
          },
        },
        {
          description:
            "Is enrollment available for all individuals in these eligibility groups?",
          slot: {
            rhf: "Select",
            label: "Alternative Benefit Plan population name",
            name: "is_enrollment_available",
            props: {
              className: "w-[150px]",
              options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
          },
        },
      ],
    },
    {
      title: "Targeting criteria",
      form: [
        {
          description: "targeting criteria (select all that apply)",
          slot: {
            rhf: "Checkbox",
            name: "target_criteria",
            label: "Mandatory or voluntary",
            props: {
              options: [
                {
                  value: "income_standard",
                  label: "Income standard",
                  form: [
                    {
                      description: "Income standard target",
                      slot: {
                        rhf: "Radio",
                        name: "income_target",
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
                    },
                    {
                      description: "Income standard definition",
                      slot: {
                        rhf: "Radio",
                        name: "income_definition",
                        props: {
                          options: [
                            {
                              label: "A percentage",
                              value: "income_definition_percentage",
                            },
                            {
                              label: "A specific amount",
                              value: "income_definition_specific",
                              slot: {
                                rhf: "Radio",
                                name: "income_definition_specific",
                                props: {
                                  options: [
                                    {
                                      label: "Statewide standard",
                                      value: "statewide_standard",
                                      form: [
                                        {
                                          slot: {
                                            rhf: "FieldArray",
                                            name: "income_definition_specific_statewide",
                                            fields: [
                                              {
                                                rhf: "Input",
                                                name: "household_size",
                                                props: {
                                                  placeholder: "enter size",
                                                  className: "w-[300px]",
                                                  label: "Household Size",
                                                },
                                              },
                                              {
                                                rhf: "Input",
                                                name: "standard",
                                                props: {
                                                  className: "w-[200px]",
                                                  placenholder: "enter amount",
                                                  label: "Standard ($)",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          description:
                                            "Is there an additional incremental amount",
                                          slot: {
                                            rhf: "Switch",
                                            name: "is_incremental_amount",
                                          },
                                        },
                                        {
                                          description:
                                            "Enter incremental dollar amount",
                                          slot: {
                                            rhf: "Text",
                                            name: "doller_incremental_amount",
                                          },
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
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
                {
                  value: "health",
                  label: "Disease, condition, diagnosis, or disorder",
                  slot: {
                    rhf: "Checkbox",
                    name: "health_conditions",
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
                          slot: {
                            rhf: "Input",
                            name: "other_description",
                            label: "Describe",
                          },
                        },
                      ],
                    },
                  },
                },
                {
                  label: "Other targeting criteria",
                  value: "other_targeting_criteria",
                  slot: {
                    rhf: "Input",
                    name: "other_targeting_criteria_description",
                    props: {
                      label: "Describe",
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
    {
      title: "Geographic Area",
      form: [
        {
          description:
            "Will the Alternative Benefit Plan population include individuals from the entire state or territory?",
          slot: {
            rhf: "Select",
            name: "is_geographic_area",
            props: {
              className: "w-[150px]",
              options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
          },
        },
        {
          description: "Select a method of geographic variation",
          slot: {
            rhf: "Radio",
            name: "geographic_variation",
            props: {
              options: [
                { label: "By country", value: "by_country" },
                { label: "By region", value: "by_region" },
                { label: "By city or town", value: "by_city_town" },
                { label: "Other geographic area", value: "other" },
              ],
            },
          },
        },
        {
          description: "Specify Countries",
          slot: {
            name: "specify_countries",
            rhf: "Text",
          },
        },
      ],
    },
    {
      title: "Additional information",
      form: [
        {
          description:
            "Other Information Related to Selection of the Section 1937 Coverage Option and the Base Benchmark Plan (optional):",
          slot: {
            name: "additional_information",
            rhf: "Textarea",
          },
        },
      ],
    },
  ],
};
