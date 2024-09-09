import { FormSchema } from "shared-types";

const ageOptions = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "10", label: "10" },
  { value: "11", label: "11" },
  { value: "12", label: "12" },
  { value: "13", label: "13" },
  { value: "14", label: "14" },
  { value: "15", label: "15" },
  { value: "16", label: "16" },
  { value: "17", label: "17" },
  { value: "18", label: "18" },
  { value: "19", label: "19" },
];

export const v202401: FormSchema = {
  header: "CS 3: Eligibility for Medicaid expansion program",
  subheader: "42 CFR 457.320(a)(2) and (3)",
  formId: "cs3",
  sections: [
    {
      title: "Income standards",
      sectionId: "income-standards",
      form: [
        {
          description:
            "Income eligibility for children under the Medicaid expansion is determined in accordance with the following income standards:",
          descriptionClassName: "text-base",
          slots: [
            {
              name: "inc-standards",
              rhf: "WrappedGroup",
              label: "Age and household income ranges",
              description:
                "There should be no overlaps in or gaps between ages.",
              descriptionAbove: true,
              labelClassName: "font-bold",
              fields: [
                {
                  rhf: "FieldArray",
                  name: "age-and-house-inc-range",
                  descriptionClassName: "age-and-house-inc-range",
                  props: {
                    appendText: "Add range",
                  },
                  addtnlRules: [
                    {
                      type: "noGapsOrOrverlaps",
                      fieldName: "age-and-house-inc-range",
                      fromField: "from-age",
                      toField: "to-age",
                      options: ageOptions,
                    },
                    {
                      type: "toGreaterThanFrom",
                      fieldName: "age-and-house-inc-range",
                      fromField: "from-age",
                      toField: "to-age",
                      message: "To age must be greater than From age",
                    },
                  ],
                  fields: [
                    {
                      rhf: "Select",
                      name: "from-age",
                      labelClassName: "text-black font-bold",
                      label: "From age",
                      formItemClassName: "w-[125px]",
                      rules: {
                        required: "* Required",
                      },

                      props: {
                        options: ageOptions,
                      },
                    },
                    {
                      rhf: "Select",
                      name: "to-age",
                      labelClassName: "text-black font-bold",
                      label: "To age",
                      formItemClassName: "w-[125px]",
                      rules: {
                        required: "* Required",
                      },
                      props: {
                        options: ageOptions,
                      },
                    },
                    {
                      rhf: "Input",
                      name: "above",
                      labelClassName: "text-black font-bold",
                      label: "Above",
                      formItemClassName: "w-[159px]",
                      props: {
                        icon: "% FPL",
                        iconRight: true,
                      },
                      rules: {
                        pattern: {
                          value: /^[0-9]\d*$/,
                          message: "Must be a positive integer value",
                        },
                        required: "* Required",
                      },
                    },
                    {
                      rhf: "Input",
                      name: "up-to-and-including",
                      labelClassName: "text-black font-bold",
                      label: "Up to and including",
                      formItemClassName: "w-[159px]",
                      rules: {
                        pattern: {
                          value: /^[0-9]\d*$/,
                          message: "Must be a positive integer value",
                        },
                        required: "* Required",
                      },
                      props: {
                        icon: "% FPL",
                        iconRight: true,
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
  ],
};
