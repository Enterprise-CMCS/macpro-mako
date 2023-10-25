import { Document } from "@/components/RHF/types";

export const ABP1: Document = {
  header: "ABP 1: Alternative Benefit Plan Populations",
  sections: [
    {
      title: "Population identification",
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
                required: "*Required",
                maxLength: {
                  value: 20,
                  message: "Max 20 Characters",
                },
              },
              props: { placeholder: "enter name" },
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
                  name: "eligibility_group",
                  label: "Eligibility group",
                  props: {
                    className: "w-[300px]",
                    options: [
                      {
                        label: "Parents and Other Caretaker Relatives",
                        value: "Parents and Other Caretaker Relatives",
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
                  label: "Mandatory or voluntary",
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
          description:
            "Is enrollment available for all individuals in these eligibility groups?",
          // dependency: {
          //   //example of a conditionally revealed field
          //   conditions: [
          //     {
          //       name: "alt_benefit_plan_population_name",
          //       type: "valueExists",
          //     },
          //   ],
          //   effect: { type: "show" },
          // },
          slots: [
            {
              rhf: "Select",
              name: "is_enrollment_available",
              label: "Alternative Benefit Plan population name",
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
      dependency: {
        // example of conditionally hidden section
        conditions: [
          {
            name: "is_enrollment_available",
            type: "expectedValue",
            expectedValue: "no",
          },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          description: "Targeting criteria (select all that apply):",
          slots: [
            {
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
                        slots: [
                          {
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
                        ],
                      },
                      {
                        description: "Income standard definition",
                        slots: [
                          {
                            rhf: "Radio",
                            name: "income_definition",
                            props: {
                              options: [
                                {
                                  label: "A percentage",
                                  value: "income_definition_percentage",
                                  slots: [
                                    {
                                      rhf: "Radio",
                                      name: "income_definition_percentage",
                                      props: {
                                        options: [
                                          {
                                            label: "Federal Poverty Level",
                                            value: "federal_poverty_level",
                                            slots: [
                                              {
                                                rhf: "Input",
                                                name: "federal_poverty_level_percentage",
                                                label:
                                                  "Enter the Federal Poverty Level percentage",
                                              },
                                            ],
                                          },
                                          {
                                            label:
                                              "SSI Federal Benefit Amount.",
                                            value: "ssi_federal_benefit_amount",
                                            slots: [
                                              {
                                                rhf: "Input",
                                                name: "ssi_federal_benefit_percentage",
                                                label:
                                                  "Enter the SSI Federal Benefit Rate percentage",
                                              },
                                            ],
                                          },
                                          {
                                            label: "Other.",
                                            value: "other",
                                            slots: [
                                              {
                                                rhf: "Input",
                                                name: "other_percentage",
                                                label:
                                                  "Enter the Other percentage",
                                              },
                                              {
                                                rhf: "Textarea",
                                                name: "other_describe",
                                                label: "Describe:",
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
                                                          placeholder:
                                                            "enter size",
                                                          className:
                                                            "w-[300px]",
                                                        },
                                                      },
                                                      {
                                                        rhf: "Input",
                                                        name: "standard",
                                                        label: "Standard ($)",
                                                        props: {
                                                          className:
                                                            "w-[200px]",
                                                          placeholder:
                                                            "enter amount",
                                                        },
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
                                            value: "region_standard", //

                                            form: [
                                              {
                                                slots: [
                                                  {
                                                    rhf: "FieldGroup",
                                                    name: "income_definition_region_statewide_group",
                                                    props: {
                                                      appendText: "Add Region",
                                                      removeText:
                                                        "Remove Region",
                                                    },
                                                    fields: [
                                                      {
                                                        rhf: "FieldArray",
                                                        name: "income_definition_region_statewide_arr",
                                                        fields: [
                                                          {
                                                            rhf: "Input",
                                                            label:
                                                              "Household Size",
                                                            name: "household_size",
                                                            props: {
                                                              placeholder:
                                                                "enter size",
                                                              className:
                                                                "w-[300px]",
                                                            },
                                                          },
                                                          {
                                                            rhf: "Input",
                                                            name: "standard",
                                                            label:
                                                              "Standard ($)",
                                                            props: {
                                                              className:
                                                                "w-[200px]",
                                                              placeholder:
                                                                "enter amount",
                                                            },
                                                          },
                                                        ],
                                                      },
                                                      {
                                                        rhf: "Switch",
                                                        label:
                                                          "Is there an additional incremental amount?",
                                                        labelStyling:
                                                          "font-bold mb-2",
                                                        name: "is_incremental_amount",
                                                      },
                                                      {
                                                        rhf: "Input",
                                                        label:
                                                          "Enter incremental dollar amount:",
                                                        labelStyling:
                                                          "font-bold mb-2",
                                                        name: "doller_incremental_amount",
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                            ],
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
              name: "is_geographic_area",
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
        {
          description: "Select a method of geographic variation",
          dependency: {
            conditions: [
              {
                name: "is_geographic_area",
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
              props: {
                options: [
                  {
                    label: "By county",
                    value: "by_county",
                    form: [
                      {
                        description: "Specify Counties",
                        slots: [
                          {
                            name: "specify_counties",
                            rhf: "Textarea",
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
                        description: "Specify Regions",
                        slots: [
                          {
                            name: "specify_regions",
                            rhf: "Textarea",
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
                        description: "Specify Cities and Towns",
                        slots: [
                          {
                            name: "specify_cities_towns",
                            rhf: "Textarea",
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
                        description: "Specify Other",
                        slots: [
                          {
                            name: "specify_other",
                            rhf: "Textarea",
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
    // {
    //   title: "Testing Alt Layouts",
    //   form: [
    //     {
    //       description: "A test of horizontal layouts with no slot styles",
    //       wrapperStyling: "flex flex-wrap gap-6",
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
    //       wrapperStyling: "flex flex-wrap gap-6",
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
