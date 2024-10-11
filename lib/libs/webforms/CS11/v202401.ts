import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header:
    "CS 11: Separate CHIP eligibility—Pregnant women who have access to public employee coverage",
  subheader:
    "Sections 2110(b)(2)(B) and (b)(6) of the Social Security Act (SSA)",
  formId: "CS11",
  sections: [
    {
      title: "Overview",
      sectionId: "overview",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "",
              styledLabel: [
                {
                  text: "Otherwise eligible",
                  type: "default",
                  classname: "text-black",
                },
                {
                  text: " targeted low-income pregnant women who have access to public employee coverage",
                  type: "bold",
                  classname: "text-black",
                },
                {
                  text: " on the basis of their own or a family member's employment",
                  type: "default",
                  classname: "text-black",
                },
              ],
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The CHIP agency operates this covered group in accordance with the following provisions.",
                    value: "true",
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
